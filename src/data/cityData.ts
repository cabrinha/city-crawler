import type { Building } from '../types/game';

// Street names from the official game data (from streets.html)
// Array indices 0-99 map to game coordinates 1-100
export const STREET_NAMES: string[] = [
  // First 50 streets (west half) - animals, trees, and other names
  'Aardvark', 'Alder', 'Buzzard', 'Beech', 'Cormorant', 'Cedar', 'Duck', 'Dogwood', 'Eagle', 'Elm',
  'Ferret', 'Fir', 'Gibbon', 'Gum', 'Haddock', 'Holly', 'Iguana', 'Ivy', 'Jackal', 'Juniper',
  'Kraken', 'Knotweed', 'Lion', 'Larch', 'Mongoose', 'Maple', 'Nightingale', 'Nettle', 'Octopus', 'Olive',
  'Pilchard', 'Pine', 'Quail', 'Quince', 'Raven', 'Ragweed', 'Squid', 'Sycamore', 'Tapir', 'Teasel',
  'Unicorn', 'Umbrella', 'Vulture', 'Vervain', 'Walrus', 'Willow', 'Yak', 'Yew', 'Zebra', 'Zelkova',

  // Second 50 streets (east half) - minerals, emotions, and malaise
  'Amethyst', 'Anguish', 'Beryl', 'Bleak', 'Cobalt', 'Chagrin', 'Diamond', 'Despair', 'Emerald', 'Ennui',
  'Flint', 'Fear', 'Gypsum', 'Gloom', 'Hessite', 'Horror', 'Ivory', 'Ire', 'Jet', 'Jaded',
  'Kyanite', 'Killjoy', 'Lead', 'Lonely', 'Malachite', 'Malaise', 'Nickel', 'Nervous', 'Obsidian', 'Oppression',
  'Pyrites', 'Pessimism', 'Quartz', 'Qualms', 'Ruby', 'Regret', 'Steel', 'Sorrow', 'Turquoise', 'Torment',
  'Uranium', 'Unctuous', 'Vauxite', 'Vexation', 'Wulfenite', 'Woe', 'Yuksporite', 'Yearning', 'Zinc', 'Zestless'
];

export const BUILDINGS: Building[] = [
  // Transit stations from the official game database (transit.html)
  { id: 'transit_1', type: 'transit', name: 'Calliope Station', coordinate: { x: 51, y: 51 } }, // Mongoose and 25th
  { id: 'transit_2', type: 'transit', name: 'Clio Station', coordinate: { x: 101, y: 51 } }, // Zelkova and 25th
  { id: 'transit_3', type: 'transit', name: 'Erato Station', coordinate: { x: 151, y: 51 } }, // Malachite and 25th
  { id: 'transit_4', type: 'transit', name: 'Eutepre Station', coordinate: { x: 51, y: 101 } }, // Mongoose and 50th
  { id: 'transit_5', type: 'transit', name: 'Melpomene Station', coordinate: { x: 101, y: 101 } }, // Zelkova and 50th
  { id: 'transit_6', type: 'transit', name: 'Polyhymnia Station', coordinate: { x: 151, y: 101 } }, // Malachite and 50th
  { id: 'transit_7', type: 'transit', name: 'Terpsichore Station', coordinate: { x: 51, y: 151 } }, // Mongoose and 75th
  { id: 'transit_8', type: 'transit', name: 'Thalia Station', coordinate: { x: 101, y: 151 } }, // Zelkova and 75th
  { id: 'transit_9', type: 'transit', name: 'Urania Station', coordinate: { x: 151, y: 151 } }, // Malachite and 75th

  // Banks from the actual game database (https://blood.pinkgothic.com/rbmlist.php?type=bank)
  // All banks are labeled "$BANK$" in the game
  // Buildings are located one square southeast of street intersections
  { id: 'bank_1', type: 'bank', name: '$BANK$', coordinate: { x: 3, y: 165 } }, // Aardvark 82 Omnibank
  { id: 'bank_2', type: 'bank', name: '$BANK$', coordinate: { x: 5, y: 81 } }, // Alder 40 Omnibank
  { id: 'bank_3', type: 'bank', name: '$BANK$', coordinate: { x: 5, y: 161 } }, // Alder 80 Omnibank
  { id: 'bank_4', type: 'bank', name: '$BANK$', coordinate: { x: 103, y: 33 } }, // Amethyst 16 Omnibank
  { id: 'bank_5', type: 'bank', name: '$BANK$', coordinate: { x: 103, y: 75 } }, // Amethyst 37 Omnibank
  { id: 'bank_6', type: 'bank', name: '$BANK$', coordinate: { x: 103, y: 199 } }, // Amethyst 99 Omnibank
  { id: 'bank_7', type: 'bank', name: '$BANK$', coordinate: { x: 105, y: 61 } }, // Anguish 30 Omnibank
  { id: 'bank_8', type: 'bank', name: '$BANK$', coordinate: { x: 105, y: 147 } }, // Anguish 73 Omnibank
  { id: 'bank_9', type: 'bank', name: '$BANK$', coordinate: { x: 105, y: 183 } }, // Anguish 91 Omnibank
  { id: 'bank_10', type: 'bank', name: '$BANK$', coordinate: { x: 9, y: 53 } }, // Beech 26 Omnibank
  { id: 'bank_11', type: 'bank', name: '$BANK$', coordinate: { x: 9, y: 79 } }, // Beech 39 Omnibank
  { id: 'bank_12', type: 'bank', name: '$BANK$', coordinate: { x: 107, y: 57 } }, // Beryl 28 Omnibank
  { id: 'bank_13', type: 'bank', name: '$BANK$', coordinate: { x: 107, y: 81 } }, // Beryl 40 Omnibank
  { id: 'bank_14', type: 'bank', name: '$BANK$', coordinate: { x: 107, y: 131 } }, // Beryl 65 Omnibank
  { id: 'bank_15', type: 'bank', name: '$BANK$', coordinate: { x: 107, y: 145 } }, // Beryl 72 Omnibank
  { id: 'bank_16', type: 'bank', name: '$BANK$', coordinate: { x: 109, y: 29 } }, // Bleak 14 Omnibank
  { id: 'bank_17', type: 'bank', name: '$BANK$', coordinate: { x: 7, y: 27 } }, // Buzzard 13 Omnibank
  { id: 'bank_18', type: 'bank', name: '$BANK$', coordinate: { x: 13, y: 3 } }, // Cedar 1 Omnibank
  { id: 'bank_19', type: 'bank', name: '$BANK$', coordinate: { x: 13, y: 105 } }, // Cedar 52 Omnibank
  { id: 'bank_20', type: 'bank', name: '$BANK$', coordinate: { x: 13, y: 161 } }, // Cedar 80 Omnibank
  { id: 'bank_21', type: 'bank', name: '$BANK$', coordinate: { x: 113, y: 47 } }, // Chagrin 23 Omnibank
  { id: 'bank_22', type: 'bank', name: '$BANK$', coordinate: { x: 113, y: 79 } }, // Chagrin 39 Omnibank
  { id: 'bank_23', type: 'bank', name: '$BANK$', coordinate: { x: 111, y: 93 } }, // Cobalt 46 Omnibank
  { id: 'bank_24', type: 'bank', name: '$BANK$', coordinate: { x: 111, y: 163 } }, // Cobalt 81 Omnibank
  { id: 'bank_25', type: 'bank', name: '$BANK$', coordinate: { x: 111, y: 177 } }, // Cobalt 88 Omnibank
  { id: 'bank_26', type: 'bank', name: '$BANK$', coordinate: { x: 11, y: 187 } }, // Cormorant 93 Omnibank
  { id: 'bank_27', type: 'bank', name: '$BANK$', coordinate: { x: 117, y: 3 } }, // Despair 1 Omnibank
  { id: 'bank_28', type: 'bank', name: '$BANK$', coordinate: { x: 117, y: 151 } }, // Despair 75 Omnibank
  { id: 'bank_29', type: 'bank', name: '$BANK$', coordinate: { x: 17, y: 9 } }, // Dogwood 4 Omnibank
  { id: 'bank_30', type: 'bank', name: '$BANK$', coordinate: { x: 15, y: 75 } }, // Duck 37 Omnibank
  { id: 'bank_31', type: 'bank', name: '$BANK$', coordinate: { x: 15, y: 155 } }, // Duck 77 Omnibank
  { id: 'bank_32', type: 'bank', name: '$BANK$', coordinate: { x: 19, y: 129 } }, // Eagle 64 Omnibank
  { id: 'bank_33', type: 'bank', name: '$BANK$', coordinate: { x: 19, y: 179 } }, // Eagle 89 Omnibank
  { id: 'bank_34', type: 'bank', name: '$BANK$', coordinate: { x: 21, y: 197 } }, // Elm 98 Omnibank
  { id: 'bank_35', type: 'bank', name: '$BANK$', coordinate: { x: 119, y: 39 } }, // Emerald 19 Omnibank
  { id: 'bank_36', type: 'bank', name: '$BANK$', coordinate: { x: 119, y: 181 } }, // Emerald 90 Omnibank
  { id: 'bank_37', type: 'bank', name: '$BANK$', coordinate: { x: 121, y: 41 } }, // Ennui 20 Omnibank
  { id: 'bank_38', type: 'bank', name: '$BANK$', coordinate: { x: 121, y: 157 } }, // Ennui 78 Omnibank
  { id: 'bank_39', type: 'bank', name: '$BANK$', coordinate: { x: 125, y: 31 } }, // Fear 15 Omnibank
  { id: 'bank_40', type: 'bank', name: '$BANK$', coordinate: { x: 23, y: 65 } }, // Ferret 32 Omnibank
  { id: 'bank_41', type: 'bank', name: '$BANK$', coordinate: { x: 23, y: 181 } }, // Ferret 90 Omnibank
  { id: 'bank_42', type: 'bank', name: '$BANK$', coordinate: { x: 25, y: 5 } }, // Fir 2 Omnibank
  { id: 'bank_43', type: 'bank', name: '$BANK$', coordinate: { x: 123, y: 75 } }, // Flint 37 Omnibank
  { id: 'bank_44', type: 'bank', name: '$BANK$', coordinate: { x: 123, y: 91 } }, // Flint 45 Omnibank
  { id: 'bank_45', type: 'bank', name: '$BANK$', coordinate: { x: 123, y: 95 } }, // Flint 47 Omnibank
  { id: 'bank_46', type: 'bank', name: '$BANK$', coordinate: { x: 123, y: 11 } }, // Flint 5 Omnibank
  { id: 'bank_47', type: 'bank', name: '$BANK$', coordinate: { x: 129, y: 69 } }, // Gloom 34 Omnibank
  { id: 'bank_48', type: 'bank', name: '$BANK$', coordinate: { x: 129, y: 143 } }, // Gloom 71 Omnibank
  { id: 'bank_49', type: 'bank', name: '$BANK$', coordinate: { x: 129, y: 179 } }, // Gloom 89 Omnibank
  { id: 'bank_50', type: 'bank', name: '$BANK$', coordinate: { x: 129, y: 181 } }, // Gloom 90 Omnibank
  { id: 'bank_51', type: 'bank', name: '$BANK$', coordinate: { x: 31, y: 93 } }, // Haddock 46 Omnibank
  { id: 'bank_52', type: 'bank', name: '$BANK$', coordinate: { x: 31, y: 105 } }, // Haddock 52 Omnibank
  { id: 'bank_53', type: 'bank', name: '$BANK$', coordinate: { x: 31, y: 135 } }, // Haddock 67 Omnibank
  { id: 'bank_54', type: 'bank', name: '$BANK$', coordinate: { x: 31, y: 149 } }, // Haddock 74 Omnibank
  { id: 'bank_55', type: 'bank', name: '$BANK$', coordinate: { x: 31, y: 177 } }, // Haddock 88 Omnibank
  { id: 'bank_56', type: 'bank', name: '$BANK$', coordinate: { x: 131, y: 79 } }, // Hessite 39 Omnibank
  { id: 'bank_57', type: 'bank', name: '$BANK$', coordinate: { x: 131, y: 153 } }, // Hessite 76 Omnibank
  { id: 'bank_58', type: 'bank', name: '$BANK$', coordinate: { x: 33, y: 193 } }, // Holly 96 Omnibank
  { id: 'bank_59', type: 'bank', name: '$BANK$', coordinate: { x: 133, y: 99 } }, // Horror 49 Omnibank
  { id: 'bank_60', type: 'bank', name: '$BANK$', coordinate: { x: 133, y: 119 } }, // Horror 59 Omnibank
  { id: 'bank_61', type: 'bank', name: '$BANK$', coordinate: { x: 137, y: 63 } }, // Ire 31 Omnibank
  { id: 'bank_62', type: 'bank', name: '$BANK$', coordinate: { x: 137, y: 85 } }, // Ire 42 Omnibank
  { id: 'bank_63', type: 'bank', name: '$BANK$', coordinate: { x: 137, y: 107 } }, // Ire 53 Omnibank
  { id: 'bank_64', type: 'bank', name: '$BANK$', coordinate: { x: 137, y: 195 } }, // Ire 97 Omnibank
  { id: 'bank_65', type: 'bank', name: '$BANK$', coordinate: { x: 135, y: 11 } }, // Ivory 5 Omnibank
  { id: 'bank_66', type: 'bank', name: '$BANK$', coordinate: { x: 135, y: 143 } }, // Ivory 71 Omnibank
  { id: 'bank_67', type: 'bank', name: '$BANK$', coordinate: { x: 37, y: 1 } }, // Ivy 0 Omnibank
  { id: 'bank_68', type: 'bank', name: '$BANK$', coordinate: { x: 37, y: 141 } }, // Ivy 70 Omnibank
  { id: 'bank_69', type: 'bank', name: '$BANK$', coordinate: { x: 37, y: 159 } }, // Ivy 79 Omnibank
  { id: 'bank_70', type: 'bank', name: '$BANK$', coordinate: { x: 39, y: 87 } }, // Jackal 43 Omnibank
  { id: 'bank_71', type: 'bank', name: '$BANK$', coordinate: { x: 141, y: 51 } }, // Jaded 25 Omnibank
  { id: 'bank_72', type: 'bank', name: '$BANK$', coordinate: { x: 141, y: 97 } }, // Jaded 48 Omnibank
  { id: 'bank_73', type: 'bank', name: '$BANK$', coordinate: { x: 141, y: 143 } }, // Jaded 71 Omnibank
  { id: 'bank_74', type: 'bank', name: '$BANK$', coordinate: { x: 41, y: 33 } }, // Juniper 16 Omnibank
  { id: 'bank_75', type: 'bank', name: '$BANK$', coordinate: { x: 41, y: 41 } }, // Juniper 20 Omnibank
  { id: 'bank_76', type: 'bank', name: '$BANK$', coordinate: { x: 41, y: 197 } }, // Juniper 98 Omnibank
  { id: 'bank_77', type: 'bank', name: '$BANK$', coordinate: { x: 45, y: 31 } }, // Knotweed 15 Omnibank
  { id: 'bank_78', type: 'bank', name: '$BANK$', coordinate: { x: 45, y: 59 } }, // Knotweed 29 Omnibank
  { id: 'bank_79', type: 'bank', name: '$BANK$', coordinate: { x: 43, y: 27 } }, // Kraken 13 Omnibank
  { id: 'bank_80', type: 'bank', name: '$BANK$', coordinate: { x: 43, y: 37 } }, // Kraken 18 Omnibank
  { id: 'bank_81', type: 'bank', name: '$BANK$', coordinate: { x: 43, y: 7 } }, // Kraken 3 Omnibank
  { id: 'bank_82', type: 'bank', name: '$BANK$', coordinate: { x: 43, y: 69 } }, // Kraken 34 Omnibank
  { id: 'bank_83', type: 'bank', name: '$BANK$', coordinate: { x: 43, y: 91 } }, // Kraken 45 Omnibank
  { id: 'bank_84', type: 'bank', name: '$BANK$', coordinate: { x: 43, y: 97 } }, // Kraken 48 Omnibank
  { id: 'bank_85', type: 'bank', name: '$BANK$', coordinate: { x: 43, y: 15 } }, // Kraken 7 Omnibank
  { id: 'bank_86', type: 'bank', name: '$BANK$', coordinate: { x: 143, y: 81 } }, // Kyanite 40 Omnibank
  { id: 'bank_87', type: 'bank', name: '$BANK$', coordinate: { x: 143, y: 13 } }, // Kyanite 6 Omnibank
  { id: 'bank_88', type: 'bank', name: '$BANK$', coordinate: { x: 49, y: 67 } }, // Larch 33 Omnibank
  { id: 'bank_89', type: 'bank', name: '$BANK$', coordinate: { x: 49, y: 15 } }, // Larch 7 Omnibank
  { id: 'bank_90', type: 'bank', name: '$BANK$', coordinate: { x: 49, y: 183 } }, // Larch 91 Omnibank
  { id: 'bank_91', type: 'bank', name: '$BANK$', coordinate: { x: 147, y: 23 } }, // Lead 11 Omnibank
  { id: 'bank_92', type: 'bank', name: '$BANK$', coordinate: { x: 147, y: 43 } }, // Lead 21 Omnibank
  { id: 'bank_93', type: 'bank', name: '$BANK$', coordinate: { x: 147, y: 177 } }, // Lead 88 Omnibank
  { id: 'bank_94', type: 'bank', name: '$BANK$', coordinate: { x: 47, y: 161 } }, // Lion 80 Omnibank
  { id: 'bank_95', type: 'bank', name: '$BANK$', coordinate: { x: 149, y: 187 } }, // Lonely 93 Omnibank
  { id: 'bank_96', type: 'bank', name: '$BANK$', coordinate: { x: 151, y: 23 } }, // Malachite 11 Omnibank
  { id: 'bank_97', type: 'bank', name: '$BANK$', coordinate: { x: 151, y: 65 } }, // Malachite 32 Omnibank
  { id: 'bank_98', type: 'bank', name: '$BANK$', coordinate: { x: 151, y: 175 } }, // Malachite 87 Omnibank
  { id: 'bank_99', type: 'bank', name: '$BANK$', coordinate: { x: 153, y: 73 } }, // Malaise 36 Omnibank
  { id: 'bank_100', type: 'bank', name: '$BANK$', coordinate: { x: 153, y: 9 } }, // Malaise 4 Omnibank
  { id: 'bank_101', type: 'bank', name: '$BANK$', coordinate: { x: 153, y: 101 } }, // Malaise 50 Omnibank
  { id: 'bank_102', type: 'bank', name: '$BANK$', coordinate: { x: 53, y: 69 } }, // Maple 34 Omnibank
  { id: 'bank_103', type: 'bank', name: '$BANK$', coordinate: { x: 53, y: 169 } }, // Maple 84 Omnibank
  { id: 'bank_104', type: 'bank', name: '$BANK$', coordinate: { x: 53, y: 171 } }, // Maple 85 Omnibank
  { id: 'bank_105', type: 'bank', name: '$BANK$', coordinate: { x: 51, y: 157 } }, // Mongoose 78 Omnibank
  { id: 'bank_106', type: 'bank', name: '$BANK$', coordinate: { x: 51, y: 159 } }, // Mongoose 79 Omnibank
  { id: 'bank_107', type: 'bank', name: '$BANK$', coordinate: { x: 51, y: 183 } }, // Mongoose 91 Omnibank
  { id: 'bank_108', type: 'bank', name: '$BANK$', coordinate: { x: 157, y: 21 } }, // Nervous 10 Omnibank
  { id: 'bank_109', type: 'bank', name: '$BANK$', coordinate: { x: 57, y: 75 } }, // Nettle 37 Omnibank
  { id: 'bank_110', type: 'bank', name: '$BANK$', coordinate: { x: 57, y: 135 } }, // Nettle 67 Omnibank
  { id: 'bank_111', type: 'bank', name: '$BANK$', coordinate: { x: 155, y: 187 } }, // Nickel 93 Omnibank
  { id: 'bank_112', type: 'bank', name: '$BANK$', coordinate: { x: 159, y: 73 } }, // Obsidian 36 Omnibank
  { id: 'bank_113', type: 'bank', name: '$BANK$', coordinate: { x: 159, y: 159 } }, // Obsidian 79 Omnibank
  { id: 'bank_114', type: 'bank', name: '$BANK$', coordinate: { x: 59, y: 55 } }, // Octopus 27 Omnibank
  { id: 'bank_115', type: 'bank', name: '$BANK$', coordinate: { x: 59, y: 143 } }, // Octopus 71 Omnibank
  { id: 'bank_116', type: 'bank', name: '$BANK$', coordinate: { x: 59, y: 155 } }, // Octopus 77 Omnibank
  { id: 'bank_117', type: 'bank', name: '$BANK$', coordinate: { x: 61, y: 19 } }, // Olive 9 Omnibank
  { id: 'bank_118', type: 'bank', name: '$BANK$', coordinate: { x: 61, y: 199 } }, // Olive 99 Omnibank
  { id: 'bank_119', type: 'bank', name: '$BANK$', coordinate: { x: 161, y: 5 } }, // Oppression 2 Omnibank
  { id: 'bank_120', type: 'bank', name: '$BANK$', coordinate: { x: 161, y: 179 } }, // Oppression 89 Omnibank
  { id: 'bank_121', type: 'bank', name: '$BANK$', coordinate: { x: 165, y: 39 } }, // Pessimism 19 Omnibank
  { id: 'bank_122', type: 'bank', name: '$BANK$', coordinate: { x: 165, y: 89 } }, // Pessimism 44 Omnibank
  { id: 'bank_123', type: 'bank', name: '$BANK$', coordinate: { x: 165, y: 175 } }, // Pessimism 87 Omnibank
  { id: 'bank_124', type: 'bank', name: '$BANK$', coordinate: { x: 63, y: 89 } }, // Pilchard 44 Omnibank
  { id: 'bank_125', type: 'bank', name: '$BANK$', coordinate: { x: 63, y: 121 } }, // Pilchard 60 Omnibank
  { id: 'bank_126', type: 'bank', name: '$BANK$', coordinate: { x: 65, y: 85 } }, // Pine 42 Omnibank
  { id: 'bank_127', type: 'bank', name: '$BANK$', coordinate: { x: 65, y: 89 } }, // Pine 44 Omnibank
  { id: 'bank_128', type: 'bank', name: '$BANK$', coordinate: { x: 163, y: 23 } }, // Pyrites 11 Omnibank
  { id: 'bank_129', type: 'bank', name: '$BANK$', coordinate: { x: 163, y: 49 } }, // Pyrites 24 Omnibank
  { id: 'bank_130', type: 'bank', name: '$BANK$', coordinate: { x: 163, y: 181 } }, // Pyrites 90 Omnibank
  { id: 'bank_131', type: 'bank', name: '$BANK$', coordinate: { x: 67, y: 21 } }, // Quail 10 Omnibank
  { id: 'bank_132', type: 'bank', name: '$BANK$', coordinate: { x: 67, y: 25 } }, // Quail 12 Omnibank
  { id: 'bank_133', type: 'bank', name: '$BANK$', coordinate: { x: 67, y: 37 } }, // Quail 18 Omnibank
  { id: 'bank_134', type: 'bank', name: '$BANK$', coordinate: { x: 67, y: 53 } }, // Quail 26 Omnibank
  { id: 'bank_135', type: 'bank', name: '$BANK$', coordinate: { x: 67, y: 73 } }, // Quail 36 Omnibank
  { id: 'bank_136', type: 'bank', name: '$BANK$', coordinate: { x: 67, y: 83 } }, // Quail 41 Omnibank
  { id: 'bank_137', type: 'bank', name: '$BANK$', coordinate: { x: 67, y: 117 } }, // Quail 58 Omnibank
  { id: 'bank_138', type: 'bank', name: '$BANK$', coordinate: { x: 67, y: 149 } }, // Quail 74 Omnibank
  { id: 'bank_139', type: 'bank', name: '$BANK$', coordinate: { x: 169, y: 57 } }, // Qualms 28 Omnibank
  { id: 'bank_140', type: 'bank', name: '$BANK$', coordinate: { x: 169, y: 115 } }, // Qualms 57 Omnibank
  { id: 'bank_141', type: 'bank', name: '$BANK$', coordinate: { x: 169, y: 151 } }, // Qualms 75 Omnibank
  { id: 'bank_142', type: 'bank', name: '$BANK$', coordinate: { x: 167, y: 151 } }, // Quartz 75 Omnibank
  { id: 'bank_143', type: 'bank', name: '$BANK$', coordinate: { x: 69, y: 97 } }, // Quince 48 Omnibank
  { id: 'bank_144', type: 'bank', name: '$BANK$', coordinate: { x: 73, y: 63 } }, // Ragweed 31 Omnibank
  { id: 'bank_145', type: 'bank', name: '$BANK$', coordinate: { x: 73, y: 113 } }, // Ragweed 56 Omnibank
  { id: 'bank_146', type: 'bank', name: '$BANK$', coordinate: { x: 71, y: 23 } }, // Raven 11 Omnibank
  { id: 'bank_147', type: 'bank', name: '$BANK$', coordinate: { x: 71, y: 31 } }, // Raven 15 Omnibank
  { id: 'bank_148', type: 'bank', name: '$BANK$', coordinate: { x: 71, y: 159 } }, // Raven 79 Omnibank
  { id: 'bank_149', type: 'bank', name: '$BANK$', coordinate: { x: 71, y: 197 } }, // Raven 98 Omnibank
  { id: 'bank_150', type: 'bank', name: '$BANK$', coordinate: { x: 173, y: 141 } }, // Regret 70 Omnibank
  { id: 'bank_151', type: 'bank', name: '$BANK$', coordinate: { x: 171, y: 37 } }, // Ruby 18 Omnibank
  { id: 'bank_152', type: 'bank', name: '$BANK$', coordinate: { x: 171, y: 91 } }, // Ruby 45 Omnibank
  { id: 'bank_153', type: 'bank', name: '$BANK$', coordinate: { x: 177, y: 97 } }, // Sorrow 48 Omnibank
  { id: 'bank_154', type: 'bank', name: '$BANK$', coordinate: { x: 177, y: 19 } }, // Sorrow 9 Omnibank
  { id: 'bank_155', type: 'bank', name: '$BANK$', coordinate: { x: 75, y: 21 } }, // Squid 10 Omnibank
  { id: 'bank_156', type: 'bank', name: '$BANK$', coordinate: { x: 75, y: 49 } }, // Squid 24 Omnibank
  { id: 'bank_157', type: 'bank', name: '$BANK$', coordinate: { x: 175, y: 63 } }, // Steel 31 Omnibank
  { id: 'bank_158', type: 'bank', name: '$BANK$', coordinate: { x: 175, y: 129 } }, // Steel 64 Omnibank
  { id: 'bank_159', type: 'bank', name: '$BANK$', coordinate: { x: 175, y: 15 } }, // Steel 7 Omnibank
  { id: 'bank_160', type: 'bank', name: '$BANK$', coordinate: { x: 77, y: 33 } }, // Sycamore 16 Omnibank
  { id: 'bank_161', type: 'bank', name: '$BANK$', coordinate: { x: 79, y: 23 } }, // Tapir 11 Omnibank
  { id: 'bank_162', type: 'bank', name: '$BANK$', coordinate: { x: 79, y: 83 } }, // Tapir 41 Omnibank
  { id: 'bank_163', type: 'bank', name: '$BANK$', coordinate: { x: 79, y: 1 } }, // Tapir Northern Omnibank
  { id: 'bank_164', type: 'bank', name: '$BANK$', coordinate: { x: 81, y: 121 } }, // Teasel 60 Omnibank
  { id: 'bank_165', type: 'bank', name: '$BANK$', coordinate: { x: 81, y: 133 } }, // Teasel 66 Omnibank
  { id: 'bank_166', type: 'bank', name: '$BANK$', coordinate: { x: 81, y: 185 } }, // Teasel 92 Omnibank
  { id: 'bank_167', type: 'bank', name: '$BANK$', coordinate: { x: 181, y: 47 } }, // Torment 23 Omnibank
  { id: 'bank_168', type: 'bank', name: '$BANK$', coordinate: { x: 181, y: 57 } }, // Torment 28 Omnibank
  { id: 'bank_169', type: 'bank', name: '$BANK$', coordinate: { x: 181, y: 63 } }, // Torment 31 Omnibank
  { id: 'bank_170', type: 'bank', name: '$BANK$', coordinate: { x: 85, y: 41 } }, // Umbrella 20 Omnibank
  { id: 'bank_171', type: 'bank', name: '$BANK$', coordinate: { x: 85, y: 161 } }, // Umbrella 80 Omnibank
  { id: 'bank_172', type: 'bank', name: '$BANK$', coordinate: { x: 185, y: 47 } }, // Unctuous 23 Omnibank
  { id: 'bank_173', type: 'bank', name: '$BANK$', coordinate: { x: 185, y: 87 } }, // Unctuous 43 Omnibank
  { id: 'bank_174', type: 'bank', name: '$BANK$', coordinate: { x: 83, y: 23 } }, // Unicorn 11 Omnibank
  { id: 'bank_175', type: 'bank', name: '$BANK$', coordinate: { x: 83, y: 157 } }, // Unicorn 78 Omnibank
  { id: 'bank_176', type: 'bank', name: '$BANK$', coordinate: { x: 183, y: 3 } }, // Uranium 1 Omnibank
  { id: 'bank_177', type: 'bank', name: '$BANK$', coordinate: { x: 183, y: 97 } }, // Uranium 48 Omnibank
  { id: 'bank_178', type: 'bank', name: '$BANK$', coordinate: { x: 183, y: 187 } }, // Uranium 93 Omnibank
  { id: 'bank_179', type: 'bank', name: '$BANK$', coordinate: { x: 183, y: 195 } }, // Uranium 97 Omnibank
  { id: 'bank_180', type: 'bank', name: '$BANK$', coordinate: { x: 187, y: 137 } }, // Vauxite 68 Omnibank
  { id: 'bank_181', type: 'bank', name: '$BANK$', coordinate: { x: 187, y: 183 } }, // Vauxite 91 Omnibank
  { id: 'bank_182', type: 'bank', name: '$BANK$', coordinate: { x: 189, y: 49 } }, // Vexation 24 Omnibank
  { id: 'bank_183', type: 'bank', name: '$BANK$', coordinate: { x: 87, y: 87 } }, // Vulture 43 Omnibank
  { id: 'bank_184', type: 'bank', name: '$BANK$', coordinate: { x: 87, y: 165 } }, // Vulture 82 Omnibank
  { id: 'bank_185', type: 'bank', name: '$BANK$', coordinate: { x: 1, y: 155 } }, // Western 77 Omnibank
  { id: 'bank_186', type: 'bank', name: '$BANK$', coordinate: { x: 93, y: 169 } }, // Willow 84 Omnibank
  { id: 'bank_187', type: 'bank', name: '$BANK$', coordinate: { x: 193, y: 89 } }, // Woe 44 Omnibank
  { id: 'bank_188', type: 'bank', name: '$BANK$', coordinate: { x: 193, y: 171 } }, // Woe 85 Omnibank
  { id: 'bank_189', type: 'bank', name: '$BANK$', coordinate: { x: 95, y: 91 } }, // Yak 45 Omnibank
  { id: 'bank_190', type: 'bank', name: '$BANK$', coordinate: { x: 95, y: 165 } }, // Yak 82 Omnibank
  { id: 'bank_191', type: 'bank', name: '$BANK$', coordinate: { x: 95, y: 189 } }, // Yak 94 Omnibank
  { id: 'bank_192', type: 'bank', name: '$BANK$', coordinate: { x: 197, y: 151 } }, // Yearning 75 Omnibank
  { id: 'bank_193', type: 'bank', name: '$BANK$', coordinate: { x: 197, y: 187 } }, // Yearning 93 Omnibank
  { id: 'bank_194', type: 'bank', name: '$BANK$', coordinate: { x: 97, y: 9 } }, // Yew 4 Omnibank
  { id: 'bank_195', type: 'bank', name: '$BANK$', coordinate: { x: 99, y: 123 } }, // Zebra 61 Omnibank
  { id: 'bank_196', type: 'bank', name: '$BANK$', coordinate: { x: 101, y: 47 } }, // Zelkova 23 Omnibank
  { id: 'bank_197', type: 'bank', name: '$BANK$', coordinate: { x: 101, y: 147 } }, // Zelkova 73 Omnibank
  { id: 'bank_198', type: 'bank', name: '$BANK$', coordinate: { x: 199, y: 149 } }, // Zinc 74 Omnibank

  // Pubs from the official game database (pub.html)
  { id: 'pub_1', type: 'pub', name: 'Abbot\'s Tavern', coordinate: { x: 29, y: 67 } }, // Gum and 33rd
  { id: 'pub_2', type: 'pub', name: 'Archer\'s Tavern', coordinate: { x: 45, y: 23 } }, // Knotweed and 11th
  { id: 'pub_3', type: 'pub', name: 'Baker\'s Tavern', coordinate: { x: 181, y: 33 } }, // Torment and 16th
  { id: 'pub_4', type: 'pub', name: 'Balmer\'s Tavern', coordinate: { x: 25, y: 27 } }, // Fir and 13th
  { id: 'pub_5', type: 'pub', name: 'Barker\'s Tavern', coordinate: { x: 57, y: 7 } }, // Nettle and 3rd
  { id: 'pub_6', type: 'pub', name: 'Bloodwood Canopy Cafe', coordinate: { x: 15, y: 15 } }, // Duck and 7th
  { id: 'pub_7', type: 'pub', name: 'Bowyer\'s Tavern', coordinate: { x: 31, y: 129 } }, // Haddock and 64th
  { id: 'pub_8', type: 'pub', name: 'Chandler\'s Tavern', coordinate: { x: 71, y: 143 } }, // Raven and 71st
  { id: 'pub_9', type: 'pub', name: 'Club Xendom', coordinate: { x: 109, y: 129 } }, // Bleak and 64th
  { id: 'pub_10', type: 'pub', name: 'Draper\'s Tavern', coordinate: { x: 63, y: 97 } }, // Pilchard and 48th
  { id: 'pub_11', type: 'pub', name: 'Falconer\'s Tavern', coordinate: { x: 95, y: 181 } }, // Yak and 90th
  { id: 'pub_12', type: 'pub', name: 'Fiddler\'s Tavern', coordinate: { x: 171, y: 41 } }, // Ruby and 20th
  { id: 'pub_13', type: 'pub', name: 'Fisher\'s Tavern', coordinate: { x: 23, y: 169 } }, // Ferret and 84th
  { id: 'pub_14', type: 'pub', name: 'Five French Hens', coordinate: { x: 65, y: 137 } }, // Pine and 68th
  { id: 'pub_15', type: 'pub', name: 'Freeman\'s Tavern', coordinate: { x: 175, y: 53 } }, // Steel and 26th
  { id: 'pub_16', type: 'pub', name: 'Harper\'s Tavern', coordinate: { x: 27, y: 197 } }, // Gibbon and 98th
  { id: 'pub_17', type: 'pub', name: 'Hawker\'s Tavern', coordinate: { x: 137, y: 127 } }, // Ire and 63rd
  { id: 'pub_18', type: 'pub', name: 'Hunter\'s Tavern', coordinate: { x: 25, y: 145 } }, // Fir and 72nd
  { id: 'pub_19', type: 'pub', name: 'Lovers at Dawn Inn', coordinate: { x: 151, y: 153 } }, // Malachite and 76th
  { id: 'pub_20', type: 'pub', name: 'Marbler\'s Tavern', coordinate: { x: 73, y: 157 } }, // Ragweed and 78th
  { id: 'pub_21', type: 'pub', name: 'Miller\'s Tavern', coordinate: { x: 23, y: 89 } }, // Ferret and 44th
  { id: 'pub_22', type: 'pub', name: 'Oyler\'s Tavern', coordinate: { x: 175, y: 7 } }, // Steel and 3rd
  { id: 'pub_23', type: 'pub', name: 'Painter\'s Tavern', coordinate: { x: 115, y: 185 } }, // Diamond and 92nd
  { id: 'pub_24', type: 'pub', name: 'Peace De Résistance', coordinate: { x: 91, y: 167 } }, // Walrus and 83rd
  { id: 'pub_25', type: 'pub', name: 'Porter\'s Tavern', coordinate: { x: 175, y: 47 } }, // Steel and 23rd
  { id: 'pub_26', type: 'pub', name: 'Pub Forty-two', coordinate: { x: 125, y: 69 } }, // Fear and 34th
  { id: 'pub_27', type: 'pub', name: 'Ratskeller', coordinate: { x: 169, y: 123 } }, // Qualms and 61st
  { id: 'pub_28', type: 'pub', name: 'Rider\'s Tavern', coordinate: { x: 107, y: 197 } }, // Beryl and 98th
  { id: 'pub_29', type: 'pub', name: 'Rogue\'s Tavern', coordinate: { x: 169, y: 11 } }, // Qualms and 5th
  { id: 'pub_30', type: 'pub', name: 'Shooter\'s Tavern', coordinate: { x: 19, y: 135 } }, // Eagle and 67th
  { id: 'pub_31', type: 'pub', name: 'Ten Turtle Doves', coordinate: { x: 105, y: 197 } }, // Anguish and 98th
  { id: 'pub_32', type: 'pub', name: 'The Angel\'s Wing', coordinate: { x: 161, y: 91 } }, // Oppression and 45th
  { id: 'pub_33', type: 'pub', name: 'The Axeman and Guillotine', coordinate: { x: 161, y: 141 } }, // Oppression and 70th
  { id: 'pub_34', type: 'pub', name: 'The Blinking Pixie', coordinate: { x: 135, y: 199 } }, // Ivory and 99th
  { id: 'pub_35', type: 'pub', name: 'The Book and Beggar', coordinate: { x: 165, y: 75 } }, // Pessimism and 37th
  { id: 'pub_36', type: 'pub', name: 'The Booze Hall', coordinate: { x: 151, y: 141 } }, // Malachite and 70th
  { id: 'pub_37', type: 'pub', name: 'The Brain and Hatchling', coordinate: { x: 163, y: 83 } }, // Pyrites and 41st
  { id: 'pub_38', type: 'pub', name: 'The Brimming Brew', coordinate: { x: 149, y: 175 } }, // Lonely and 87th
  { id: 'pub_39', type: 'pub', name: 'The Broken Lover', coordinate: { x: 169, y: 87 } }, // Qualms and 43rd
  { id: 'pub_40', type: 'pub', name: 'The Burning Brand', coordinate: { x: 171, y: 181 } }, // Ruby and 90th
  { id: 'pub_41', type: 'pub', name: 'The Cart and Castle', coordinate: { x: 91, y: 137 } }, // Walrus and 68th
  { id: 'pub_42', type: 'pub', name: 'The Celtic Moonlight', coordinate: { x: 47, y: 3 } }, // Lion and 1st
  { id: 'pub_43', type: 'pub', name: 'The Clam and Champion', coordinate: { x: 9, y: 39 } }, // Beech and 19th
  { id: 'pub_44', type: 'pub', name: 'The Cosy Walrus', coordinate: { x: 55, y: 65 } }, // Nightingale and 32nd
  { id: 'pub_45', type: 'pub', name: 'The Crossed Swords Tavern', coordinate: { x: 177, y: 141 } }, // Sorrow and 70th
  { id: 'pub_46', type: 'pub', name: 'The Crouching Tiger', coordinate: { x: 29, y: 21 } }, // Gum and 10th
  { id: 'pub_47', type: 'pub', name: 'The Crow\'s Nest Tavern', coordinate: { x: 145, y: 93 } }, // Killjoy and 46th
  { id: 'pub_48', type: 'pub', name: 'The Dead of Night', coordinate: { x: 65, y: 103 } }, // Pine and 51st
  { id: 'pub_49', type: 'pub', name: 'The Dog House', coordinate: { x: 73, y: 13 } }, // Ragweed and 6th
  { id: 'pub_50', type: 'pub', name: 'The Drunk Cup', coordinate: { x: 199, y: 189 } }, // Zinc and 94th
  { id: 'pub_51', type: 'pub', name: 'The Ferryman\'s Arms', coordinate: { x: 95, y: 61 } }, // Yak and 30th
  { id: 'pub_52', type: 'pub', name: 'The Flirty Angel', coordinate: { x: 157, y: 5 } }, // Nervous and 2nd
  { id: 'pub_53', type: 'pub', name: 'The Freudian Slip', coordinate: { x: 177, y: 183 } }, // Sorrow and 91st
  { id: 'pub_54', type: 'pub', name: 'The Ghastly Flabber', coordinate: { x: 91, y: 125 } }, // Walrus and 62nd
  { id: 'pub_55', type: 'pub', name: 'The Golden Patridge', coordinate: { x: 47, y: 191 } }, // Lion and 95th
  { id: 'pub_56', type: 'pub', name: 'The Guardian Outpost', coordinate: { x: 97, y: 157 } }, // Yew and 78th
  { id: 'pub_57', type: 'pub', name: 'The Gunny\'s Shack', coordinate: { x: 159, y: 109 } }, // Obsidian and 54th
  { id: 'pub_58', type: 'pub', name: 'The Hearth and Sabre', coordinate: { x: 189, y: 5 } }, // Vexation and 2nd
  { id: 'pub_59', type: 'pub', name: 'The Hell\'s Angels Clubhouse', coordinate: { x: 131, y: 111 } }, // Hessite and 55th
  { id: 'pub_60', type: 'pub', name: 'The Kestrel', coordinate: { x: 17, y: 109 } }, // Dogwood and 54th
  { id: 'pub_61', type: 'pub', name: 'The Last Days', coordinate: { x: 51, y: 31 } }, // Mongoose and 15th
  { id: 'pub_62', type: 'pub', name: 'The Lazy Sunflower', coordinate: { x: 83, y: 185 } }, // Unicorn and 92nd
  { id: 'pub_63', type: 'pub', name: 'The Lightbringer', coordinate: { x: 157, y: 85 } }, // Nervous and 42nd
  { id: 'pub_64', type: 'pub', name: 'The Lounge', coordinate: { x: 143, y: 39 } }, // Kyanite and 19th
  { id: 'pub_65', type: 'pub', name: 'The Marsupial', coordinate: { x: 197, y: 97 } }, // Yearning and 48th
  { id: 'pub_66', type: 'pub', name: 'The McAllister Tavern', coordinate: { x: 131, y: 195 } }, // Hessite and 97th
  { id: 'pub_67', type: 'pub', name: 'The Moon', coordinate: { x: 17, y: 157 } }, // Dogwood and 78th
  { id: 'pub_68', type: 'pub', name: 'The Ox and Bow', coordinate: { x: 27, y: 89 } }, // Gibbon and 44th
  { id: 'pub_69', type: 'pub', name: 'The Palm & Parson Public Tavern', coordinate: { x: 39, y: 107 } }, // Jackal and 53rd
  { id: 'pub_70', type: 'pub', name: 'The Poltroon', coordinate: { x: 67, y: 171 } }, // Quail and 85th
  { id: 'pub_71', type: 'pub', name: 'The Red Arch', coordinate: { x: 109, y: 1 } }, // Bleak and NCL
  { id: 'pub_72', type: 'pub', name: 'The Round Room', coordinate: { x: 171, y: 43 } }, // Ruby and 21st
  { id: 'pub_73', type: 'pub', name: 'The Scupper and Forage', coordinate: { x: 115, y: 3 } }, // Diamond and 1st
  { id: 'pub_74', type: 'pub', name: 'The Shattered Platter', coordinate: { x: 65, y: 183 } }, // Pine and 91st
  { id: 'pub_75', type: 'pub', name: 'The Shining Devil', coordinate: { x: 155, y: 115 } }, // Nickel and 57th
  { id: 'pub_76', type: 'pub', name: 'The Sign of the Times', coordinate: { x: 5, y: 115 } }, // Alder and 57th
  { id: 'pub_77', type: 'pub', name: 'The Stick and Stag', coordinate: { x: 121, y: 161 } }, // Ennui and 80th
  { id: 'pub_78', type: 'pub', name: 'The Sun', coordinate: { x: 153, y: 175 } }, // Malaise and 87th
  { id: 'pub_79', type: 'pub', name: 'The Sunken Sofa', coordinate: { x: 19, y: 69 } }, // Eagle and 34th
  { id: 'pub_80', type: 'pub', name: 'The Swords at Dawn', coordinate: { x: 179, y: 143 } }, // Turquoise and 71st
  { id: 'pub_81', type: 'pub', name: 'The Teapot and Toxin', coordinate: { x: 21, y: 187 } }, // Elm and 93rd
  { id: 'pub_82', type: 'pub', name: 'The Thief of Hearts', coordinate: { x: 51, y: 185 } }, // Mongoose and 92nd
  { id: 'pub_83', type: 'pub', name: 'The Thorn\'s Pride', coordinate: { x: 117, y: 77 } }, // Despair and 38th
  { id: 'pub_84', type: 'pub', name: 'The Two Sisters', coordinate: { x: 99, y: 73 } }, // Zebra and 36th
  { id: 'pub_85', type: 'pub', name: 'The Wart and Whisk', coordinate: { x: 57, y: 173 } }, // Nettle and 86th
  { id: 'pub_86', type: 'pub', name: 'The Whirling Dervish', coordinate: { x: 77, y: 179 } }, // Sycamore and 89th
  { id: 'pub_87', type: 'pub', name: 'The Wild Hunt', coordinate: { x: 87, y: 23 } }, // Vulture and 11th
  { id: 'pub_88', type: 'pub', name: 'Vagabond\'s Tavern', coordinate: { x: 97, y: 11 } }, // Yew and 5th
  { id: 'pub_89', type: 'pub', name: 'Xendom Tavern', coordinate: { x: 105, y: 137 } }, // Anguish and 68th
  { id: 'pub_90', type: 'pub', name: 'Ye Olde Gallows Ale House', coordinate: { x: 163, y: 141 } }, // Pyrites and 70th

  // Halls
  { id: 'hall_of_binding', type: 'other', name: 'Hall of Binding', coordinate: { x: 100, y: 100 } }, // Vervain and 40th
  { id: 'hall_of_severance', type: 'other', name: 'Hall of Severance', coordinate: { x: 100, y: 100 } }, // Walrus and 40th

  // Special Shops
  { id: 'cloister_of_secrets', type: 'other', name: 'Cloister of Secrets', coordinate: { x: 100, y: 100 } }, // Gloom and 1st
  { id: 'the_sanguinarium', type: 'other', name: 'The Sanguinarium', coordinate: { x: 100, y: 100 } }, // Fear and 4th
  { id: 'the_sepulchre_of_shadows', type: 'other', name: 'The Sepulchre of Shadows', coordinate: { x: 100, y: 100 } }, // Ennui and 1st
  { id: 'the_eternal_aubade_of_mystical_treasures', type: 'other', name: 'The Eternal Aubade of Mystical Treasures', coordinate: { x: 100, y: 100 } }, // Zelkova and 47th

  // Guilds
  { id: 'allurists_guild_1', type: 'guild', name: 'Allurists Guild 1', coordinate: { x: 100, y: 100 } },
  { id: 'allurists_guild_2', type: 'guild', name: 'Allurists Guild 2', coordinate: { x: 100, y: 100 } },
  { id: 'allurists_guild_3', type: 'guild', name: 'Allurists Guild 3', coordinate: { x: 100, y: 100 } },
  { id: 'empaths_guild_1', type: 'guild', name: 'Empaths Guild 1', coordinate: { x: 100, y: 100 } },
  { id: 'empaths_guild_2', type: 'guild', name: 'Empaths Guild 2', coordinate: { x: 100, y: 100 } },
  { id: 'empaths_guild_3', type: 'guild', name: 'Empaths Guild 3', coordinate: { x: 100, y: 100 } },
  { id: 'immolators_guild_1', type: 'guild', name: 'Immolators Guild 1', coordinate: { x: 100, y: 100 } },
  { id: 'immolators_guild_2', type: 'guild', name: 'Immolators Guild 2', coordinate: { x: 100, y: 100 } },
  { id: 'immolators_guild_3', type: 'guild', name: 'Immolators Guild 3', coordinate: { x: 100, y: 100 } },
  { id: 'thieves_guild_1', type: 'guild', name: 'Thieves Guild 1', coordinate: { x: 100, y: 100 } },
  { id: 'thieves_guild_2', type: 'guild', name: 'Thieves Guild 2', coordinate: { x: 100, y: 100 } },
  { id: 'thieves_guild_3', type: 'guild', name: 'Thieves Guild 3', coordinate: { x: 100, y: 100 } },
  { id: 'travellers_guild_1', type: 'guild', name: 'Travellers Guild 1', coordinate: { x: 100, y: 100 } },
  { id: 'travellers_guild_2', type: 'guild', name: 'Travellers Guild 2', coordinate: { x: 100, y: 100 } },
  { id: 'travellers_guild_3', type: 'guild', name: 'Travellers Guild 3', coordinate: { x: 100, y: 100 } },

  // Scroll Shops
  { id: 'scroll_shop_1', type: 'shop', name: 'Discount Scrolls', coordinate: { x: 100, y: 100 } },
  { id: 'scroll_shop_2', type: 'shop', name: 'Herman\'s Scrolls', coordinate: { x: 100, y: 100 } },
  { id: 'scroll_shop_3', type: 'shop', name: 'Paper and Scrolls', coordinate: { x: 100, y: 100 } },
  { id: 'scroll_shop_4', type: 'shop', name: 'Scrollmania', coordinate: { x: 100, y: 100 } },
  { id: 'scroll_shop_5', type: 'shop', name: 'Scrolls \'n\' Stuff', coordinate: { x: 100, y: 100 } },
  { id: 'scroll_shop_6', type: 'shop', name: 'Scrolls R Us', coordinate: { x: 100, y: 100 } },
  { id: 'scroll_shop_7', type: 'shop', name: 'Ye Olde Scrolles', coordinate: { x: 100, y: 100 } },
  { id: 'scroll_shop_8', type: 'shop', name: 'Scrollworks', coordinate: { x: 100, y: 100 } },

  // Potion Shops
  { id: 'potion_shop_1', type: 'shop', name: 'Discount Potions', coordinate: { x: 100, y: 100 } },
  { id: 'potion_shop_2', type: 'shop', name: 'McPotions', coordinate: { x: 100, y: 100 } },
  { id: 'potion_shop_3', type: 'shop', name: 'Potable Potions', coordinate: { x: 100, y: 100 } },
  { id: 'potion_shop_4', type: 'shop', name: 'Potion Distillery', coordinate: { x: 100, y: 100 } },
  { id: 'potion_shop_5', type: 'shop', name: 'Potionworks', coordinate: { x: 100, y: 100 } },
  { id: 'potion_shop_6', type: 'shop', name: 'Silver Apothecary', coordinate: { x: 100, y: 100 } },
  { id: 'potion_shop_7', type: 'shop', name: 'The Potion Shoppe', coordinate: { x: 100, y: 100 } },

  // Magic Shops
  { id: 'magic_shop_1', type: 'shop', name: 'Discount Magic', coordinate: { x: 100, y: 100 } },
  { id: 'magic_shop_2', type: 'shop', name: 'Dark Desires', coordinate: { x: 100, y: 100 } },
  { id: 'magic_shop_3', type: 'shop', name: 'Interesting Times', coordinate: { x: 100, y: 100 } },
  { id: 'magic_shop_4', type: 'shop', name: 'Sparks', coordinate: { x: 100, y: 100 } },
  { id: 'magic_shop_5', type: 'shop', name: 'The Magic Box', coordinate: { x: 100, y: 100 } },
  { id: 'magic_shop_6', type: 'shop', name: 'White Light', coordinate: { x: 100, y: 100 } },

  // Pawn Shops
  { id: 'pawn_shop_1', type: 'shop', name: 'Spinners Pawn', coordinate: { x: 100, y: 100 } },
  { id: 'pawn_shop_2', type: 'shop', name: 'Ace Pawn', coordinate: { x: 100, y: 100 } },
  { id: 'pawn_shop_3', type: 'shop', name: 'Checkers Pawn', coordinate: { x: 100, y: 100 } },
  { id: 'pawn_shop_4', type: 'shop', name: 'Reversi Pawn', coordinate: { x: 100, y: 100 } },

  // Vampire Lairs from the official game database (lair.html)
  { id: 'lair_1', type: 'lair', name: 'Ace\'s House of Dumont', coordinate: { x: 13, y: 199 } }, // Cedar and 99th
  { id: 'lair_2', type: 'lair', name: 'Alatáriël Maenor', coordinate: { x: 115, y: 101 } }, // Diamond and 50th
  { id: 'lair_3', type: 'lair', name: 'Alpha Dragon\'s and Lyric\'s House of Dragon and Flame', coordinate: { x: 103, y: 181 } }, // Amethyst and 90th
  { id: 'lair_4', type: 'lair', name: 'AmadisdeGaula\'s Stellaburgi', coordinate: { x: 191, y: 77 } }, // Wulfenite and 38th
  { id: 'lair_5', type: 'lair', name: 'Andre\'s Crypt', coordinate: { x: 23, y: 21 } }, // Ferret and 10th
  { id: 'lair_6', type: 'lair', name: 'Annabelle\'s Paradise', coordinate: { x: 119, y: 171 } }, // Emerald and 85th
  { id: 'lair_7', type: 'lair', name: 'Anthony\'s Gero Claw', coordinate: { x: 87, y: 79 } }, // Vulture and 39th
  { id: 'lair_8', type: 'lair', name: 'Aphaythean Vineyards', coordinate: { x: 93, y: 27 } }, // Willow and 13th
  { id: 'lair_9', type: 'lair', name: 'Archangel\'s Castle', coordinate: { x: 9, y: 9 } }, // Beech and 4th
  { id: 'lair_10', type: 'lair', name: 'Avant\'s Garden', coordinate: { x: 103, y: 137 } }, // Amethyst and 68th
  { id: 'lair_11', type: 'lair', name: 'bitercat\'s mews', coordinate: { x: 47, y: 85 } }, // Lion and 42nd
  { id: 'lair_12', type: 'lair', name: 'black_dragonet\'s mansion', coordinate: { x: 161, y: 161 } }, // Oppression and 80th
  { id: 'lair_13', type: 'lair', name: 'Blutengel\'s Temple of Blood', coordinate: { x: 125, y: 27 } }, // Fear and 13th
  { id: 'lair_14', type: 'lair', name: 'Cair Paravel', coordinate: { x: 47, y: 55 } }, // Lion and 27th
  { id: 'lair_15', type: 'lair', name: 'Capadocian Castle', coordinate: { x: 49, y: 99 } }, // Larch and 49th
  { id: 'lair_16', type: 'lair', name: 'Castle of Shadows', coordinate: { x: 179, y: 173 } }, // Turquoise and 86th
  { id: 'lair_17', type: 'lair', name: 'Castle RavenesQue', coordinate: { x: 71, y: 1 } }, // Raven and NCL
  { id: 'lair_18', type: 'lair', name: 'ChaosRaven\'s Dimensional Tower', coordinate: { x: 145, y: 47 } }, // Killjoy and 23rd
  { id: 'lair_19', type: 'lair', name: 'CHASS\'s forever-blues hall', coordinate: { x: 181, y: 151 } }, // Torment and 75th
  { id: 'lair_20', type: 'lair', name: 'CrimsonClover\'s Hideaway', coordinate: { x: 115, y: 171 } }, // Diamond and 85th
  { id: 'lair_21', type: 'lair', name: 'CrowsSong\'s Blackbird Towers', coordinate: { x: 191, y: 7 } }, // Wulfenite and 3rd
  { id: 'lair_22', type: 'lair', name: 'D\'dary Manor', coordinate: { x: 3, y: 3 } }, // Aardvark and 1st
  { id: 'lair_23', type: 'lair', name: 'Daphne\'s Dungeons', coordinate: { x: 151, y: 129 } }, // Malachite and 64th
  { id: 'lair_24', type: 'lair', name: 'DarkestDesire\'s Chambers', coordinate: { x: 117, y: 113 } }, // Despair and 56th
  { id: 'lair_25', type: 'lair', name: 'deaths embrace\'s House of R\'lyeh', coordinate: { x: 33, y: 163 } }, // Holly and 81st
  { id: 'lair_26', type: 'lair', name: 'Devil Miyu\'s Abeir-Toril', coordinate: { x: 125, y: 5 } }, // Fear and 2nd
  { id: 'lair_27', type: 'lair', name: 'Devil Miyu\'s Edge of Reason', coordinate: { x: 125, y: 1 } }, // Fear and NCL
  { id: 'lair_28', type: 'lair', name: 'Devil Miyu\'s Lair', coordinate: { x: 125, y: 3 } }, // Fear and 1st
  { id: 'lair_29', type: 'lair', name: 'ElishaDraken\'s Sanguine Ankh', coordinate: { x: 55, y: 119 } }, // Nightingale and 59th
  { id: 'lair_30', type: 'lair', name: 'espy\'s Jaded Sorrows', coordinate: { x: 141, y: 139 } }, // Jaded and 69th
  { id: 'lair_31', type: 'lair', name: 'Freedom Trade Alliance', coordinate: { x: 103, y: 93 } }, // Amethyst and 46th
  { id: 'lair_32', type: 'lair', name: 'Gypsychild\'s Caravan', coordinate: { x: 181, y: 139 } }, // Torment and 69th
  { id: 'lair_33', type: 'lair', name: 'Hesu\'s Place', coordinate: { x: 71, y: 49 } }, // Raven and 24th
  { id: 'lair_34', type: 'lair', name: 'Hexenkessel', coordinate: { x: 39, y: 167 } }, // Jackal and 83rd
  { id: 'lair_35', type: 'lair', name: 'Jacomo Varis\' Shadow Manor', coordinate: { x: 71, y: 193 } }, // Raven and 96th
  { id: 'lair_36', type: 'lair', name: 'jaxi\'s and Speedy\'s Cave', coordinate: { x: 71, y: 47 } }, // Raven and 23rd
  { id: 'lair_37', type: 'lair', name: 'King Lestat\'s Le Paradis Caché', coordinate: { x: 111, y: 181 } }, // Cobalt and 90th
  { id: 'lair_38', type: 'lair', name: 'La Cucina', coordinate: { x: 115, y: 57 } }, // Diamond and 28th
  { id: 'lair_39', type: 'lair', name: 'Lady Ophy\'s and WhiteLighter\'s Abode', coordinate: { x: 153, y: 189 } }, // Malaise and 94th
  { id: 'lair_40', type: 'lair', name: 'LadyFae\'s and nitenurse\'s Solas Gealaí Caisleán', coordinate: { x: 71, y: 153 } }, // Raven and 76th
  { id: 'lair_41', type: 'lair', name: 'Lass\' Lair', coordinate: { x: 89, y: 3 } }, // Vervain and 1st
  { id: 'lair_42', type: 'lair', name: 'Lord Galamushi\'s Enchanted Mansion', coordinate: { x: 105, y: 105 } }, // Anguish and 52nd
  { id: 'lair_43', type: 'lair', name: 'Majica\'s Playground', coordinate: { x: 93, y: 101 } }, // Willow and 50th
  { id: 'lair_44', type: 'lair', name: 'Marlena\'s Wishing Well', coordinate: { x: 125, y: 113 } }, // Fear and 56th
  { id: 'lair_45', type: 'lair', name: 'Master Dracula\'s and Juliana\'s Abode', coordinate: { x: 129, y: 153 } }, // Gloom and 76th
  { id: 'lair_46', type: 'lair', name: 'Moirai\'s Gate to the Church of Blood', coordinate: { x: 133, y: 27 } }, // Horror and 13th
  { id: 'lair_47', type: 'lair', name: 'Moonlight Gardens', coordinate: { x: 179, y: 175 } }, // Turquoise and 87th
  { id: 'lair_48', type: 'lair', name: 'Ms Delgado\'s Manor', coordinate: { x: 177, y: 139 } }, // Sorrow and 69th
  { id: 'lair_49', type: 'lair', name: 'MyMotherInLaw\'s Home for Wayward Ghouls', coordinate: { x: 103, y: 139 } }, // Amethyst and 69th
  { id: 'lair_50', type: 'lair', name: 'NightWatch Headquarters', coordinate: { x: 49, y: 103 } }, // Larch and 51st
  { id: 'lair_51', type: 'lair', name: 'obsidian\'s Arboretum', coordinate: { x: 159, y: 177 } }, // Obsidian and 88th
  { id: 'lair_52', type: 'lair', name: 'obsidian\'s Castle of Warwick', coordinate: { x: 159, y: 1 } }, // Obsidian and NCL
  { id: 'lair_53', type: 'lair', name: 'obsidian\'s Château de la Lumière', coordinate: { x: 159, y: 133 } }, // Obsidian and 66th
  { id: 'lair_54', type: 'lair', name: 'obsidian\'s château noir', coordinate: { x: 159, y: 199 } }, // Obsidian and 99th
  { id: 'lair_55', type: 'lair', name: 'obsidian\'s Hall of Shifting Realms', coordinate: { x: 159, y: 31 } }, // Obsidian and 15th
  { id: 'lair_56', type: 'lair', name: 'obsidian\'s Penthouse', coordinate: { x: 159, y: 59 } }, // Obsidian and 29th
  { id: 'lair_57', type: 'lair', name: 'obsidian\'s Silver Towers', coordinate: { x: 159, y: 103 } }, // Obsidian and 51st
  { id: 'lair_58', type: 'lair', name: 'obsidian\'s Tranquility', coordinate: { x: 159, y: 161 } }, // Obsidian and 80th
  { id: 'lair_59', type: 'lair', name: 'obsidians, Phoenixxe\'s and Em\'s Heaven\'s Gate', coordinate: { x: 159, y: 91 } }, // Obsidian and 45th
  { id: 'lair_60', type: 'lair', name: 'Occamrazor\'s House of Ears', coordinate: { x: 97, y: 61 } }, // Yew and 30th
  { id: 'lair_61', type: 'lair', name: 'Ordo Dracul Sanctum', coordinate: { x: 55, y: 155 } }, // Nightingale and 77th
  { id: 'lair_62', type: 'lair', name: 'Palazzo Lucius', coordinate: { x: 99, y: 55 } }, // Zebra and 27th
  { id: 'lair_63', type: 'lair', name: 'Pandrora and CBK\'s Chamber of Horrors', coordinate: { x: 181, y: 191 } }, // Torment and 95th
  { id: 'lair_64', type: 'lair', name: 'RemipunX\'s Sacred Yew', coordinate: { x: 111, y: 85 } }, // Cobalt and 42nd
  { id: 'lair_65', type: 'lair', name: 'renovate\'s grove', coordinate: { x: 85, y: 143 } }, // Umbrella and 71st
  { id: 'lair_66', type: 'lair', name: 'Saki\'s Fondest Wish', coordinate: { x: 55, y: 35 } }, // Nightingale and 17th
  { id: 'lair_67', type: 'lair', name: 'Samantha Dawn\'s Salacious Sojourn', coordinate: { x: 105, y: 107 } }, // Anguish and 53rd
  { id: 'lair_68', type: 'lair', name: 'Sartori\'s Domicile', coordinate: { x: 21, y: 3 } }, // Elm and 1st
  { id: 'lair_69', type: 'lair', name: 'SCORPIOUS1\'s Tower of Truth', coordinate: { x: 197, y: 117 } }, // Yearning and 58th
  { id: 'lair_70', type: 'lair', name: 'setitevampyr\'s Temple', coordinate: { x: 71, y: 101 } }, // Raven and 50th
  { id: 'lair_71', type: 'lair', name: 'Shaarinya\'s Sanguine Sanctuary', coordinate: { x: 71, y: 155 } }, // Raven and 77th
  { id: 'lair_72', type: 'lair', name: 'Shadow bat\'s Sanctorium', coordinate: { x: 111, y: 153 } }, // Cobalt and 76th
  { id: 'lair_73', type: 'lair', name: 'SIE Compound', coordinate: { x: 71, y: 27 } }, // Raven and 13th
  { id: 'lair_74', type: 'lair', name: 'starreagle\'s Paradise Lair', coordinate: { x: 107, y: 49 } }, // Beryl and 24th
  { id: 'lair_75', type: 'lair', name: 'Steele Industries', coordinate: { x: 85, y: 89 } }, // Umbrella and 44th
  { id: 'lair_76', type: 'lair', name: 'stormy jayne\'s web', coordinate: { x: 155, y: 199 } }, // Nickel and 99th
  { id: 'lair_77', type: 'lair', name: 'Talon Castle', coordinate: { x: 93, y: 71 } }, // Willow and 35th
  { id: 'lair_78', type: 'lair', name: 'tejas_dragon\'s Lair', coordinate: { x: 101, y: 139 } }, // Zelkova and 69th
  { id: 'lair_79', type: 'lair', name: 'The Calignite', coordinate: { x: 19, y: 33 } }, // Eagle and 16th
  { id: 'lair_80', type: 'lair', name: 'The COVE', coordinate: { x: 45, y: 103 } }, // Knotweed and 51st
  { id: 'lair_81', type: 'lair', name: 'The Dragons Lair Club', coordinate: { x: 89, y: 79 } }, // Vervain and 39th
  { id: 'lair_82', type: 'lair', name: 'The Eternal Spiral', coordinate: { x: 105, y: 139 } }, // Anguish and 69th
  { id: 'lair_83', type: 'lair', name: 'The goatsucker\'s lair', coordinate: { x: 95, y: 27 } }, // Yak and 13th
  { id: 'lair_84', type: 'lair', name: 'The Halls of Heorot', coordinate: { x: 141, y: 151 } }, // Jaded and 75th
  { id: 'lair_85', type: 'lair', name: 'The Inner Circle Manor', coordinate: { x: 115, y: 53 } }, // Diamond and 26th
  { id: 'lair_86', type: 'lair', name: 'The Ivory Tower', coordinate: { x: 101, y: 153 } }, // Zelkova and 76th
  { id: 'lair_87', type: 'lair', name: 'The Ixora Estate', coordinate: { x: 147, y: 97 } }, // Lead and 48th
  { id: 'lair_88', type: 'lair', name: 'The Lokason Myrkrasetur', coordinate: { x: 191, y: 81 } }, // Wulfenite and 40th
  { id: 'lair_89', type: 'lair', name: 'The Path of Enlightenment Castle', coordinate: { x: 93, y: 161 } }, // Willow and 80th
  { id: 'lair_90', type: 'lair', name: 'The RavenBlack Bite', coordinate: { x: 161, y: 81 } }, // Oppression and 40th
  { id: 'lair_91', type: 'lair', name: 'The Reynolds\' Estate', coordinate: { x: 107, y: 47 } }, // Beryl and 23rd
  { id: 'lair_92', type: 'lair', name: 'The River Passage', coordinate: { x: 97, y: 67 } }, // Yew and 33rd
  { id: 'lair_93', type: 'lair', name: 'The Sakura Garden', coordinate: { x: 155, y: 155 } }, // Nickel and 77th
  { id: 'lair_94', type: 'lair', name: 'The Sanctum of Vermathrax-rex and Bellina', coordinate: { x: 189, y: 199 } }, // Vexation and 99th
  { id: 'lair_95', type: 'lair', name: 'The Scythe\'s Negotiation Offices', coordinate: { x: 187, y: 177 } }, // Vauxite and 88th
  { id: 'lair_96', type: 'lair', name: 'The Sepulchre of Shadows', coordinate: { x: 121, y: 3 } }, // Ennui and 1st
  { id: 'lair_97', type: 'lair', name: 'The Towers of the Crossed Swords', coordinate: { x: 181, y: 133 } }, // Torment and 66th
  { id: 'lair_98', type: 'lair', name: 'Wilde Sanctuary', coordinate: { x: 93, y: 103 } }, // Willow and 51st
  { id: 'lair_99', type: 'lair', name: 'Wilde Wolfe Estate', coordinate: { x: 89, y: 101 } }, // Vervain and 50th
  { id: 'lair_100', type: 'lair', name: 'Willhelm\'s Warrior House', coordinate: { x: 133, y: 107 } }, // Horror and 53rd
  { id: 'lair_101', type: 'lair', name: 'Willow Woods\' & The Ent Moot', coordinate: { x: 93, y: 109 } }, // Willow and 54th
  { id: 'lair_102', type: 'lair', name: 'Wolfe Mansion', coordinate: { x: 197, y: 41 } }, // Yearning and 20th
  { id: 'lair_103', type: 'lair', name: 'Wolfe Mansion', coordinate: { x: 93, y: 41 } }, // Willow and 20th
  { id: 'lair_104', type: 'lair', name: 'Wolfshadow\'s and Crazy\'s RBC Casino', coordinate: { x: 147, y: 145 } }, // Lead and 72nd
  { id: 'lair_105', type: 'lair', name: 'Wyndcryer\'s TygerNight\'s and Bambi\'s Lair', coordinate: { x: 83, y: 155 } }, // Unicorn and 77th
  { id: 'lair_106', type: 'lair', name: 'X', coordinate: { x: 119, y: 1 } }, // Emerald and NCL
];

export const CITY_SIZE = 200; // 200x200 grid without border

export function getStreetNumber(index: number): string {
  // Y=1 = Northern City Limits
  // Y=2,3 = 1st Street, Y=4,5 = 2nd Street, ..., Y=200,201 = 100th Street
  if (index === 1) {
    return "Northern City Limits";
  }
  const streetNum = Math.floor((index - 2) / 2) + 1;
  if (streetNum < 1) {
    return "Northern City Limits";
  }
  return `${streetNum}${streetNum === 1 ? 'st' : streetNum === 2 ? 'nd' : streetNum === 3 ? 'rd' : 'th'}`;
}

export function getStreetName(index: number): string {
  // X=1 = Western City Limits
  // X=2,3 = Aardvark, X=4,5 = Alder, ..., X=200,201 = Zestless
  if (index === 1) {
    return "Western City Limits";
  }
  const streetIndex = Math.floor((index - 2) / 2);
  if (streetIndex < 0 || streetIndex >= STREET_NAMES.length) {
    return "Western City Limits";
  }
  return STREET_NAMES[streetIndex];
}

export function getLocationName(x: number, y: number): string {
  const streetName = getStreetName(x);     // X = named streets (east-west)
  const streetNumber = getStreetNumber(y); // Y = numbered streets (north-south)

  // Check if this is an intersection (even coordinates) or building location (odd coordinates)
  const isIntersection = (x % 2 === 0) && (y % 2 === 0);
  const isBuildingLocation = (x % 2 === 1) && (y % 2 === 1);

  if (isIntersection) {
    // This is an intersection
    return `${streetName} & ${streetNumber}`;
  }

  if (isBuildingLocation) {
    // This is a building location - described as being "at" the intersection it's southeast of
    // Building at (x,y) is southeast of intersection at (x-1,y-1)
    const intersectionStreetName = getStreetName(x - 1);
    const intersectionStreetNumber = getStreetNumber(y - 1);
    return `${intersectionStreetName} & ${intersectionStreetNumber}`;
  }

  // This is a street (mixed even/odd coordinates)
  return `${streetName} & ${streetNumber}`;
}

export function getBuildingAt(x: number, y: number): Building | undefined {
  return BUILDINGS.find(building => building.coordinate.x === x && building.coordinate.y === y);
}

// Calculate distance-based score for a city block based on distance from nearest bank
export function getDistanceScore(x: number, y: number): number {
  // Get all bank locations
  const banks = BUILDINGS.filter(building => building.type === 'bank');

  if (banks.length === 0) {
    return 0;
  }

  // Calculate minimum distance to any bank using Manhattan distance
  let minDistance = Number.POSITIVE_INFINITY;
  for (const bank of banks) {
    const distance = Math.abs(x - bank.coordinate.x) + Math.abs(y - bank.coordinate.y);
    minDistance = Math.min(minDistance, distance);
  }

  // Convert distance to a score (0-1 range)
  // Normalize based on maximum possible distance in the grid
  const maxDistance = 400; // Approximate max distance in 200x200 grid
  const normalizedScore = Math.min(minDistance / maxDistance, 1);

  return normalizedScore;
}