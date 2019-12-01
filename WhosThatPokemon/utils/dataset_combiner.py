import csv


class Pokeclass:
    def __init__(self, input_data: list):
        self.name = input_data[30]
        self.type1 = input_data[36]
        self.type2 = input_data[37]
        self.id = int(input_data[32])
        self.long_id = "{:03d}".format(self.id)

        self.capture_rate = input_data[23]
        self.gen_introduced = input_data[39]
        self.is_legendary = input_data[40]
        self.height = input_data[27]
        self.weight = input_data[38]

        self.attack = '--'
        self.defense = '--'
        self.sp_attack = '--'
        self.sp_defense = '--'
        self.hp = '--'
        self.speed = '--'
        self.total = '--'

        self.ev_from = '--'
        self.ev_to = '--'
        self.is_base = '--'
        self.is_full_ev = '--'
        self.evo_family = '--'

        self.locations = '--'


if __name__ == '__main__':
    mon_dict = dict()
    with open(r"../data/pokemon_data/pokemon.csv", "r", encoding='utf-8') as file:
        file.readline()
        reader = csv.reader(file)
        for line in reader:
            mon_dict["{:03d}".format(int(line[32]))] = Pokeclass(line)

    with open(r"../data/pokemon_data/stats.csv", "r", encoding='utf-8') as file:
        file.readline()
        reader = csv.reader(file)
        for line in reader:
            mon_dict[line[1]].total = line[2]
            mon_dict[line[1]].hp = line[3]
            mon_dict[line[1]].attack = line[4]
            mon_dict[line[1]].defense = line[5]
            mon_dict[line[1]].sp_attack = line[6]
            mon_dict[line[1]].sp_defense = line[7]
            mon_dict[line[1]].speed = line[8]

    with open(r"../data/pokemon_data/evolutions2.csv", "r", encoding='utf-8') as file:
        file.readline()
        reader = csv.reader(file)
        for line in reader:
            mon_dict[line[1]].ev_from = line[2]
            mon_dict[line[1]].ev_to = line[3]
            mon_dict[line[1]].is_base = line[4]
            mon_dict[line[1]].is_full_ev = line[5]
            mon_dict[line[1]].evo_family = line[6]

    with open(r"../data/pokemon_data/locations.csv", "r", encoding='utf-8') as file:
        file.readline()
        reader = csv.reader(file)
        for line in reader:
            mon_dict[line[1]].locations = line[2]

    # for x in mon_dict.values():
    #     print(x.hp)

    with open(r"../data/pokemon_data/main_collection.csv", "w", encoding='utf-8', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(['name', 'long_id',
                         'stat_total', 'hp', 'attack', 'defense', 'sp_attack', 'sp_defense', 'speed',
                         'type1', 'type2', 'ev_from', 'ev_to', 'is_base', 'is_full_ev', 'evo_family',
                         'capture_rate', 'gen_introduced', 'is_legendary', 'height_m', 'weight_kg',
                         'locations'])
        for key in mon_dict.keys():
            mon = mon_dict[key]
            writer.writerow([mon.name, mon.long_id,
                             mon.total, mon.hp, mon.attack, mon.defense, mon.sp_attack, mon.sp_defense, mon.speed,
                             mon.type1, mon.type2, mon.ev_from, mon.ev_to, mon.is_base, mon.is_full_ev, mon.evo_family,
                             mon.capture_rate, mon.gen_introduced, mon.is_legendary, mon.height, mon.weight,
                             mon.locations])



