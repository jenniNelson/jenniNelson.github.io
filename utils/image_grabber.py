import wget

### Commented out for safety

# if __name__ == '__main__':

    # for dex in range(1, 810):
    #     image_url = f'https://www.serebii.net/sunmoon/pokemon/{dex:03d}.png'
    #     print(image_url)
    #     local_image_filename = wget.download(image_url, out="../data/pokemon_data/sprites")
    #     print(local_image_filename)


# if __name__ == '__main__':
#
#     types = ["Bug", "Dark", "Dragon", "Electric", "Fairy",
#              "Fighting","Fire", "Flying", "Ghost",
#              "Grass", "Ground", "Ice", "Normal",
#              "Poison", "Psychic", "Rock", "Steel",
#              "Water"]
#     for type in types:
#         image_url = f'https://www.serebii.net/pokedex-bw/type/{type.lower()}.gif'
#         print(image_url)
#         local_image_filename = wget.download(image_url, out="../data/pokemon_data/typelabels")
#         print(local_image_filename)