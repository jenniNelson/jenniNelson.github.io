import csv
from urllib.request import (
    urlopen, urlparse, urlunparse, urlretrieve
)
import re
from bs4 import BeautifulSoup as bs


class Pokemon3:
    def __init__(self, input):
        self.name = input[0]
        self.long_id = input[1]


extensions = [
    '',
    '-gs',
    '-rs',
    '-dp',
    '-bw',
    '-xy',
    '-sm'
]


def find_game(location_tag):
    parent = location_tag.parent.parent
    game = parent.find("tr").find("td").find("a").string
    # return str(sibling.find("a").string)
    return str(game.strip().replace('/', '|'))


def find_locations(location_tag):
    parent = location_tag.parent.parent
    links = re.findall(r"pokearth/.*\.shtml", str(parent))
    better_matchs = re.findall(r'pokearth/.*\.shtml.*<', str(parent))
    names = list(map(lambda d: d.split('>')[1].split('<')[0].split('-')[0].strip(), better_matchs))
    # print(names)
    locs = list(map(lambda d: d.split('/')[-1][:-6], links))
    regions = list(map(lambda d: d.split('/')[1], links))
    results = list()
    for i in range(len(names)):
        if names[i]:
            results.append(regions[i] + '/' + names[i])
    return results


if __name__ == '__main__':

    mons = list()

    with open("../data/pokemon_data/stats.csv", 'r', encoding='utf-8') as file:
        file.readline()
        reader = csv.reader(file)
        for line in reader:
            mon = Pokemon3(line)
            mons.append(mon)

    patrat = mons[503]
    weedle = mons[12]

    games = set()
    poke_locations = dict()

    scrape_size = len(mons)

    for i in range(scrape_size):
        p = mons[i]
        poke_locations[p.long_id] = set()
        for ex in extensions:
            try:
                soup = bs(urlopen("https://www.serebii.net/pokedex{}/location/{}.shtml".format(ex, p.long_id), timeout=5),
                          features="html.parser")
            except:
                continue
            heads = soup.findAll('td', attrs={'class': 'lochead'})
            locationTags = list(filter(lambda d: str(d).find("Location") >= 0, heads))
            for tag in locationTags:
                game = find_game(tag)
                if game == "Let's Go, Eevee!" or game == "Let's Go, Pikachu!":
                    continue
                games.add(game)
                locations = find_locations(tag)
                full_locations = set(map(lambda d: game + '/' + d, locations))
                poke_locations[p.long_id].update(full_locations)
        print(p.name, p.long_id, list(poke_locations[p.long_id]))


    # ---- We don't need to write to a file anymore. Commenting this out for safety. ----

    # print("\nWriting file\n")
    # with open(r"../data/pokemon_data/locations.csv", 'w', encoding='utf-8', newline='') as file:
    #     writer = csv.writer(file)
    #     writer.writerow(['name','id','locations'])
    #     for i in range(scrape_size):
    #         p = mons[i]
    #         writer.writerow([p.name, p.long_id, str(list(poke_locations[p.long_id]))])

    print(games)




