export type Location = {
    id: 'westville' | 'northtown' | 'uptown' | 'downtown' | 'docks' | 'suburbia';
    name: 'Westville' | 'Northtown' | 'Uptown' | 'Downtown' | 'Docks' | 'Suburbia';
    dealers: string[];
    suppliers: string[];
    customers: string[];
    unlocked: boolean;
}

export const NPC_BY_LOCATION_ID: Record<Location['id'], string[]> = {
    westville: [
        'trent_sherman',
        'meg_cooley',
        'joyce_ball',
        'keith_wagner',
        'doris_lubbin',
        'kim_delaney',
        'charles_rowland',
        'jerry_montero',
        'dean_webster',
        'goerge_greene'
    ],
    northtown: [
        'jessi_waters',
        'kathy_henderson',
        'kyle_cooley',
        'austin_steiner',
        'sam_thompson',
        'mick_lubbin',
        'peter_file',
        'chloe_bowers',
        'donna_martin',
        'peggy_myers',
        'mrs_ming',
        'beth_penn',
        'ludwig_meyer',
        'geraldine_poon'
    ],
    uptown: [
        'ray_hoffman',
        'lily_hancock',
        'fiona_hancock',
        'jen_heard',
        'walter_cussler',
        'herbert_blueball',
        'micheal_boog',
        'tobias_wentworth',
        'pearl_moore'
    ],
    downtown: [
        'jeff_gilmore',
        'elizabeth_homley',
        'lucy_pennington',
        'jennifer_rivera',
        'louis_fourier',
        'kevin_oakley',
        'eugene_buckley',
        'philip_wentworth',
        'randy_caulfield',
    ],
    docks: [
        'javier_perez',
        'genghis_barn',
        'anna_chesterfield',
        'lisa_gardener',
        'cranky_frank',
        'marco_baron',
        'mac_cooper',
        'billy_kramer',
        'melissa_wood'
    ],
    suburbia: [
        'karen_kennedy',
        'jackie_stevenson',
        'hank_stevenson',
        'dennis_kennedy',
        'jack_knight',
        'carl_bundy',
        'harold_colt',
        'jeremy_wilkinson',
    ]
};

export const NPC_BY_DEALER_ID: Record<string, string[]> = {
    'benji_coleman': [
        'austin_steiner',
        'beth_penn',
        'chloe_bowers',
        'donna_martin',
        'kathy_henderson',
        'kyle_cooley',
        'ludwig_meyer',
        'mick_lubbin',
    ],
    'molly_presley': [
        'charles_rowland',
        'doris_lubbin',
        'joyce_ball',
        'keith_wagner',
        'kim_delaney',
        'meg_cooley',
        'trent_sherman',
        'jerry_montero',
    ],
    'brad_crosby': [
        'ming',
        'peggy_myers',
        'peter_file',
        'sam_thompson',
        'elizabeth_homley',
        'eugene_buckley',
        'greg_figgle',
        'jeff_gilmore'
    ],
    'jane_lucero': [
        'jennifer_rivera',
        'kevin_oakley',
        'louis_fourier',
        'lucy_pennington',
        'philip_wentworth',
        'randy_caulfield',
        'anna_chesterfield',
        'billy_kramer',
    ],
    'wei_long': [
        'cranky_frank',
        'genghis_barn',
        'javier_perez',
        'lisa_gardener',
        'mac_cooper',
        'marco_baron',
        'melissa_wood'
    ]
}


export const LOCATION_BY_DEALER_ID: Record<string, Location['id']> = {
    'benji_coleman': 'northtown',
    'molly_presley': 'westville',
    'brad_crosby': 'downtown',
    'jane_lucero': 'docks',
    'wei_long': 'suburbia',
    'leo_rivers': 'uptown'
};

export const LOCATION_BY_ID: Record<Location['id'], string> = {
    westville: 'Westville',
    northtown: 'Northtown',
    uptown: 'Uptown',
    downtown: 'Downtown',
    docks: 'Docks',
    suburbia: 'Suburbia'
}