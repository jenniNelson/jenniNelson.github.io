types = [
    "normal",
    "fire",
    "water",
    "grass",
    "electric",
    "ice",
    "fighting",
    "poison",
    "ground",
    "flying",
    "psychic",
    "bug",
    "rock",
    "ghost",
    "dragon",
    "dark",
    "steel",
    "fairy"
]


class Combo:
    def __init__(self, type1, type2):
        self.type1 = type1
        self.type2 = type2
        self.o_score = 0
        self.d_score = 0
        self.total = 0


offense_map = {
    1: 0,
    2: 1,
    4: 2,
    .5: -1,
    .25: -2,
    0: -2
}

defense_map = {
    1: 0,
    2: -1,
    4: -2,
    .5: 1,
    .25: 2,
    0: 2
}


matchups = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, .5, 0, 1, 1, .5, 1],
    [1, .5, .5, 2, 1, 2, 1, 1, 1, 1, 1, 2, .5, 1, .5, 1, 2, 1],
    [1, 2, .5, .5, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, .5, 1, 1, 1],
    [1, .5, 2, .5, 1, 1, 1, .5, 2, .5, 1, .5, 2, 1, .5, 1, .5, 1],
    [1, 1, 2, .5, .5, 1, 1, 1, 0, 2, 1, 1, 1, 1, .5, 1, 1, 1],
    [1, .5, .5, 2, 1, .5, 1, 1, 2, 2, 1, 1, 1, 1, 2, 1, .5, 1],
    [2, 1, 1, 1, 1, 2, 1, .5, 1, .5, .5, .5, 2, 0, 1, 2, 2, .5],
    [1, 1, 1, 2, 1, 1, 1, .5, .5, 1, 1, 1, .5, .5, 1, 1, 0, 2],
    [1, 2, 1, .5, 2, 1, 1, 2, 1, 0, 1, .5, 2, 1, 1, 1, 2, 1],
    [1, 1, 1, 2, .5, 1, 2, 1, 1, 1, 1, 2, .5, 1, 1, 1, .5, 1],
    [1, 1, 1, 1, 1, 1, 2, 2, 1, 1, .5, 1, 1, 1, 1, 0, .5, 1],
    [1, .5, 1, 2, 1, 1, .5, .5, 1, .5, 2, 1, 1, .5, 1, 2, .5, .5],
    [1, 2, 1, 1, 1, 2, .5, 1, .5, 2, 1, 2, 1, 1, 1, 1, .5, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, .5, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, .5, 0],
    [1, 1, 1, 1, 1, 1, .5, 1, 1, 1, 2, 1, 1, 2, 1, .5, 1, .5],
    [1, .5, .5, 1, .5, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, .5, 2],
    [1, .5, 1, 1, 1, 1, 2, .5, 1, 1, 1, 1, 1, 1, 2, 2, .5, 1]
]


def rate_offense(i, j=-1):
    if j == -1:
        score = 0
        for x in matchups[i]:
            score += offense_map[x]
        return score
    else:
        score = 0
        for idx in range(len(types)):
            score += offense_map[max(matchups[i][idx], matchups[j][idx])]
        return score


def rate_defense(i, j=-1):
    if j == -1:
        score = 0
        for row in matchups:
            score += defense_map[row[i]]
        return score
    else:
        score = 0
        for idx in range(len(types)):
            score += defense_map[matchups[idx][i]*matchups[idx][j]]
        return score


if __name__ == '__main__':

    best_offense = (-1, -1, -1)
    best_defense = (-1, -1, -1)
    best_overall = (-1, -1, -1)
    combos = []

    for i in range(len(types)):
        print("---", i, "---", types[i])
        for j in range(i, len(types)):
            thing = Combo(i, j)
            if i == j:
                thing.o_score = rate_offense(i)
                thing.d_score = rate_defense(i)
                thing.total = thing.o_score*1 + thing.d_score*.75
                print(types[i], thing.o_score, thing.d_score, thing.total)
            else:
                thing.o_score = rate_offense(i, j)
                thing.d_score = rate_defense(i, j)
                thing.total = thing.o_score*1 + thing.d_score*.75
                print(types[i], types[j], thing.o_score, thing.d_score, thing.total)
            combos.append(thing)

    print("sorted by offense:")
    new_list = reversed(sorted(combos, key=lambda d: d.o_score))
    for i in new_list:
        print(types[i.type1], types[i.type2], i.o_score)
    print("\nsorted by defense:")
    new_list = reversed(sorted(combos, key=lambda d: d.d_score))
    for i in new_list:
        print(types[i.type1], types[i.type2], i.d_score)
    print("\nsorted by total:")
    new_list = reversed(sorted(combos, key=lambda d: d.total))
    for i in new_list:
        print(types[i.type1], types[i.type2], i.total)


