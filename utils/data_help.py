import csv
from urllib.request import (
    urlopen, urlparse, urlunparse, urlretrieve
)
import re
from bs4 import BeautifulSoup as bs


class Pokemon:
    def __init__(self, input_data: list):
        self.name = input_data[30]
        self.attack = input_data[19]
        self.hp = input_data[28]
        self.defense = input_data[25]
        self.sp_attack = input_data[33]
        self.sp_defense = input_data[34]
        self.speed = input_data[35]
        self.type1 = input_data[36]
        self.type2 = input_data[37]
        self.id = int(input_data[32])
        self.long_id = "{:03d}".format(self.id)
        self.gen = input_data[39]
        self.is_legendary = input_data[40]
        self.height = input_data[27]
        self.weight = input_data[38]


def find_evo_chain(index):
    src = bs(urlopen("https://www.serebii.net/pokedex-sm/{}.shtml".format(pokedex[index].long_id), timeout=5),
             features="html.parser")
    table = src.find_all('table', attrs={'class': 'evochain'})[0]

    table_string = str(table)
    matches = re.findall(r'pokemon/\d{3}\.png', table_string)
    evo_involved = list(map(lambda s: s[-7:-4], matches))  # matches.map( lambda s : s[-7:-4] )
    return evo_involved

def find_actual_stats(mon):
    soup = bs(urlopen("https://www.serebii.net/pokedex-sm/{}.shtml".format(mon.long_id), timeout=5),
              features="html.parser")
    stats = list(
        map(
            lambda d: int(re.sub(r'\D', '', d.text)),
            soup.find('a', attrs={"name": "stats"}).find_next_sibling().find('tr')
                                                   .find_next_sibling().find_next_sibling().find_all('td')
        )
    )
    return stats


def stats_match(mon, act_stats):
    return (mon.hp == act_stats[1] and mon.attack == act_stats[2] and mon.defense == act_stats[3]
            and mon.sp_attack == act_stats[4] and mon.sp_defense == act_stats[5] and mon.speed == act_stats[6])


if __name__ == '__main__':
    print("\n--------    Reading Pokemon File...    --------\n")
    pokedex = list()
    with open('../data/pokemon_data/pokemon.csv', 'r', encoding='utf-8', newline='') as data:
        text = data.readline().strip().split(',')
        categoryToIndex = dict()
        for i in range(len(text)):
            categoryToIndex[text[i]] = i
        reader = csv.reader(data)
        for row in reader:
            mon = Pokemon(row)
            print(mon.id, mon.name)
            pokedex.append(mon)

    # print("\n-------   Scraping and Writing Stat info for Pokemon -------\n")
    # with open(r"../data/pokemon_data/stats.csv", 'w', encoding='utf-8', newline='') as file:
    #     writer = csv.writer(file)
    #     writer.writerow(["name","long_id","stat_total","hp","attack","defense","sp_attack","sp_defense","speed","type1","type2","gen","is_legendary","height_m","weight_kg"])
    #     for mon in pokedex:
    #         act_stats = find_actual_stats(mon)
    #         print(mon.name, mon.id, act_stats)
    #         writer.writerow([mon.name, mon.long_id,
    #                          act_stats[0], act_stats[1], act_stats[2], act_stats[3],
    #                          act_stats[4], act_stats[5], act_stats[6],
    #                          mon.type1, mon.type2, mon.gen, mon.is_legendary, mon.height, mon.weight])


    # print("\n--------    Scraping Evolution Data...    --------\n")
    # ev_info = list()
    # for i in range(len(pokedex)):
    #     chain = find_evo_chain(i)
    #
    #     long_index = pokedex[i].long_id
    #
    #     # hack for incorrect data
    #
    #     if chain.count(long_index) > 0:
    #         chain_pos = chain.index(long_index)
    #     else:
    #         chain.append(long_index)
    #         chain_pos = len(chain) - 1
    #         print("!!!!!! Couldn't find image? !!!!!!")
    #     ev_from = ""
    #     ev_to = ""
    #     is_base = 0
    #     is_full_ev = 0
    #     if chain_pos > 0:
    #         ev_from = chain[chain_pos - 1]
    #     if chain_pos < len(chain) - 1:
    #         ev_to = chain[chain_pos + 1]
    #     if not ev_from:
    #         is_base = 1
    #     if not ev_to:
    #         is_full_ev = 1
    #
    #     print(pokedex[i].name, long_index, ev_from, ev_to, is_base, is_full_ev, chain)
    #     ev_info.append([pokedex[i].name, long_index, ev_from, ev_to, is_base, is_full_ev, str(chain)])

    # print("\n--------    Writing Evolution File...    --------\n")
    # Data is already gathered. This is no longer necessary. Do not overwrite the file!
    # with open("../data/evolutions.csv", 'w', newline='', encoding='utf-8') as evo_file:
    #     writer = csv.writer(evo_file)
    #     writer.writerow(["name", "long_index", "ev_from", "ev_to", "is_base", "is_full_ev", "evo_family"])
    #     writer.writerows(ev_info)








