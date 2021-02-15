import csv
from urllib.request import (
    urlopen, urlparse, urlunparse, urlretrieve
)
import re
from bs4 import BeautifulSoup as bs
from collections import defaultdict


class Pokemon:
    # def __init__(self, input_data: list):
    #     self.name = name
    #     self.attack = attack
    #     self.hp = hp
    #     self.defense = defense
    #     self.sp_attack = sp_attack
    #     self.sp_defense = sp_defense
    #     self.speed = speed
    #     self.type1 = type1
    #     self.type2 = type2
    #     self.id = id
    #     self.long_id = long_id
    #     self.gen = gen
    #     self.is_legendary = is_legendary
    #     self.height = height
    #     self.weight = weight


    def __init__(self, name, attack, hp, defense, special, sp_attack, sp_defense,
                 type1, type2, id, to_list = [], to_list_as_ids=[], gen=None, is_legendary=None,
                 speed=None, height=None, weight=None):
        self.name = name
        self.attack = attack
        self.hp = hp
        self.defense = defense
        self.special = special
        self.sp_attack = sp_attack
        self.sp_defense = sp_defense
        self.type1 = type1
        self.type2 = type2
        self.id = id
        self.to_list = to_list
        self.to_list_as_ids = to_list_as_ids
        self.gen = gen
        self.is_legendary = is_legendary
        self.speed = speed
        self.height = height
        self.weight = weight

        self.ev_from = []
        self.ev_from_as_ids = []
        self.is_base_evol = True
        self.is_full_evol = True
        self.full_evol_family = None # Don't really need this

class PokeSpot:
    def __init__(self, num, name, method, rate, pokemon_found):
        self.num=num
        self.name=name
        self.method=method
        self.rate=rate
        self.pokemon_found=pokemon_found


def make_evolution_links_from_re_match(match):
    start = match.group('from')
    group1 = match.group('togroup')
    lastto = match.group('lastto')
    to = [x.strip() for x in group1.split(',')]
    if lastto:
        to.append(lastto)
    evols = [(start, t) for t in to]
    return evols


def make_pokemon_from_stats_re_match(match):
    id = int(match.group('id'))
    name = match.group('name')
    type1 = match.group('type1')
    type2 = match.group('type2')
    hp = int(match.group('hp'))
    attack = int(match.group('atk'))
    defense = int(match.group('def'))
    special = int(match.group('spe'))
    sp_attack = int(match.group('satk'))
    sp_defense = int(match.group('sdef'))
    ability1 = match.group('ability1')
    ability2 = match.group('ability2')
    item = match.group('item')

    if ability2 == " -":
        ability2 = None
    if item == "":
        item = None

    return Pokemon(name, attack, hp, defense, special, sp_attack, sp_defense, type1, type2, id)

def get_location_from_match(match):
    place_num = int(match.group('num'))
    place = match.group('place')
    method = match.group('method')
    rate = int('rate')

    all_mon = match.group('allmon')
    mon_re = re.compile(r'(?P<mon>[A-Z]*?) Lv(?P<level>\d{1,3})')
    mons = mon_re.findall(all_mon)
    mons = [(mon[0], int(mon[1]) for mon in mons)]

    return PokeSpot(place_num, place, method, rate, mons)

# Give every pokemon its list of evolves-from and evolves-to
def translate_evol_data(evolutions: defaultdict, pokedex : dict):
    for evolver, evolvees in evolutions.items():
        pokedex[evolver].to_list = evolvees
        pokedex[evolver].to_list_as_ids = [pokedex[v].id for v in evolvees]
        for v in evolvees:
            pokedex[v].ev_from.append(evolver)
            pokedex[v].ev_from_as_ids.append(pokedex[evolver].id)

# def translate_loc_data(locations: defaultdict, pokedex:dict):
#     for locname, mons in locations.items():
#         mon.locations +=


def parse_log(logfilename):
    pokedex = dict()
    evolutions = defaultdict(list)
    locations = defaultdict(list)

    with open(logfilename, 'r', encoding='utf-8', newline='') as file_object:
        stats_re = re.compile(r'(?P<id>\d{1,3})\|\s*?(?P<name>[A-Z]*?)\s*?\|\s*?(?P<type1>[A-Z]*?)(?:\s*?\/\s*?(?P<type2>[A-Z]*?))?\s*?\|\s*?(?P<hp>\d*?)\s*?\|\s*?(?P<atk>\d*?)\s*?\|\s*?(?P<def>\d*?)\s*?\|\s*?(?P<spe>\d*?)\s*?\|\s*?(?P<satk>\d*?)\s*?\|\s*?(?P<sdef>\d*?)\s*?\|\s*?(?P<ability1>.*?)\s*?\|\s*?(?P<ability2>.*?)\s*?\|\s*?(?P<item>.*?)\n')
        evolves_re = re.compile(r'(?P<from>[A-Z]*?) now evolves into (?P<togroup>[A-Z, \d:]*)(?:and (?P<lastto>[A-Z, \d:]*))?')

        soulsilver_locs = r'Route \d\d?|New Bark Town|Cherrygrove City|Violet City|Sprout Tower|Ruins of Alph|Union Cave|SLOWPOKE|Ilex Forest|National Park|Ecruteak City|Burned Tower|Bell Tower|Olivine City|Whirl Islands|Cianwood City|Mt\. Mortar|Ice Path|Blackthorn City|Dragon’s Den|Dark Cave|Seafoam Islands|Mt\. Silver Cave|Cliff Edge Gat|Cliff Cave|Bell Tower|Mt\. Silver|Safari Zone|Pallet Town|Viridian City|Cerulean City|Vermilion City|Celadon City|Fuchsia City|Cinnabar Island|Mt\. Moon|Rock Tunnel|Victory Road|Tohjo Falls|DIGLETT’s Cave|Victory Road|Viridian Forest|Cerulean Cave|Bug Catching Contest'

        loc_strings = [soulsilver_locs]

        all_locs = '|'.join([f'(?:{loc_str})' for loc_str in loc_strings])
        loc_re = re.compile(r'Set #(?P<num>\d{1,3}) - (?P<place>'+ all_locs + r') (?P<method>.*?) \(rate=(?P<rate>\d\d?)\) - (?P<allmon>.*)')



        line = True
        mode = "stats"
        while line:
            line = file_object.readline()
            if line == "--Pokemon Base Stats & Types--":
                mode = "stats"
                continue
            elif line == "--Randomized Evolutions--":
                mode = "evolutions"
                continue
            elif line == "--Wild Pokemon--":
                mode = "locations"
                continue
            # elif line == "Move Data: Unchanged.":
            #     moves = None
            # elif line == "Pokemon Movesets: Unchanged.":
            # elif line == "":
            # elif line == "":
            # elif line == "":

            elif line == "":
                mode = "blankspace"
                continue

            if mode == "blankspace":
                continue

            elif mode == "stats":
                match = stats_re.search(line)
                if match:
                    pokemon = make_pokemon_from_stats_re_match(match)
                    pokedex[pokemon.name] = pokemon


            elif mode == "evolutions":
                match = evolves_re.search(line)
                if match:
                    links = make_evolution_links_from_re_match(match)
                    for link in links:
                        evolutions[link[0]].append(link[1])

            elif mode == "locations":
                match = loc_re.search(line)
                if match:
                    location = get_location_from_match(match)
                    locations[location.name].append(location)

        ### Translate into our data formats ###

        translate_evol_data(evolutions, pokedex)
        # trannslate_loc_data(locations, pokedex)


