import csv


class EvoNode:
    def __init__(self, params):
        self.name = params[0]
        self.long_id = params[1]
        self.ev_from = params[2]
        self.ev_to = params[3]
        self.ev_base = params[4]
        self.ev_full = params[5]
        self.ev_fam = list(map(lambda s: s.strip(" '[]"), params[6].split(',')))


if __name__ == '__main__':
    evos = []
    with open(r"../data/pokemon_data/evolutions.csv", 'r', encoding='utf-8') as file:
        file.readline()
        reader = csv.reader(file)
        for line in reader:
            evos.append(EvoNode(line))

    # id_map = dict()
    # for mon in evos:
    #     id_map[mon.long_id] = mon
    id_to_ev_set = dict()
    for mon in evos:
        ev_to_set = []
        for other in evos:
            if other.ev_from == mon.long_id:
                ev_to_set.append(other.long_id)
        id_to_ev_set[mon.long_id] = ev_to_set
        if len(ev_to_set) > 1:
            print(mon.name, ev_to_set)

    # ----Evolution2 file already written and cleaned. Don't touch it anymore!
    # print('\nwriting new file\n')
    #
    # with open(r"../data/pokemon_data/evolutions2.csv", 'w', encoding='utf-8', newline='') as file:
    #     writer = csv.writer(file)
    #     writer.writerow(['name','long_id','ev_from','ev_to','is_base','is_full_ev','evo_family'])
    #     for mon in evos:
    #         writer.writerow([mon.name, mon.long_id, mon.ev_from,
    #                          id_to_ev_set[mon.long_id], mon.ev_base,
    #                          mon.ev_full, mon.ev_fam])



