import math
import csv


def poke_distance(p1, p2):
    return math.sqrt(
        (p1.attack - p2.attack)**2 + (p1.defense - p2.defense)**2 + (p1.hp - p2.hp)**2 +
        (p1.sp_attack - p2.sp_attack)**2 + (p1.sp_defense - p2.sp_defense)**2 + (p1.speed - p2.speed)**2
    )


def total_distance(p, poke_list):
    return sum(map(lambda d: poke_distance(p, d), poke_list))


class stat_mon:
    def __init__(self, stats):
        self.name = stats[0]
        self.long_id = stats[1]
        self.hp = int(stats[3])
        self.attack = int(stats[4])
        self.defense = int(stats[5])
        self.sp_attack = int(stats[6])
        self.sp_defense = int(stats[7])
        self.speed = int(stats[8])
        self.total = int(stats[2])


if __name__ == '__main__':
    mons = list()
    with open("../data/pokemon_data/stats.csv", 'r', encoding='utf-8') as file:
        file.readline()
        reader = csv.reader(file)
        for line in reader:
            mon = stat_mon(line)
            mons.append(mon)

    relatives = dict()
    # for mon in mons:
    mon = mons[350]
    print(mon.name, "Closest neighbors")
    relatives[mon.long_id] = sorted(mons, key=lambda d: poke_distance(mon, d))

    for i in range(100):
        print(relatives[mon.long_id][i].name, poke_distance(mon, relatives[mon.long_id][i]))

    print("\n------------\n")

    nearest_to_everyone = sorted(mons, key=lambda d: total_distance(d, mons))

    for i in range(len(mons)):
        print(nearest_to_everyone[i].name, "total distance:", total_distance(nearest_to_everyone[i], mons), "stats:",
              nearest_to_everyone[i].hp,nearest_to_everyone[i].attack,nearest_to_everyone[i].defense,
              nearest_to_everyone[i].sp_attack,nearest_to_everyone[i].sp_defense,nearest_to_everyone[i].speed)

    # for m in relatives[mon.long_id]:
    #     print(m.name, poke_distance(mon,m), mon.name + " stats: ", mon.hp,mon.attack,mon.defense,mon.sp_attack,mon.sp_defense,mon.speed,
    #           m.name + " stats: " , m.hp, m.attack, m.defense, m.sp_attack, m.sp_defense, m.speed)
    #     # break

