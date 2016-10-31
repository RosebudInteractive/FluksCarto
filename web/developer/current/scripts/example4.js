/**
 * Created by kiknadze on 13.01.2016.
 */

var ex4 = {
    "data": {
        "services": [
            {
                "id": "1",
                "name": "Service A",
                "description": "Service A description",
                "data": { },
                "services": [
                    {
                        "id": "1_1",
                        "name": "Service B",
                        "description": "Service B description",
                        "data": null,
                        "services": [
                            {
                                "id": "1_1_1",
                                "name": "Service C",
                                "description": "Service B description",
                                "data": null,
                                "services": [ ],
                                "sectors": [
                                    {
                                        "id": "s1",
                                        "name": "Sector 1",
                                        "description": "Sector 1 description",
                                        "data": {
                                            "Temperature": 20,
                                            "SomeData": "Custom data"
                                        },
                                        "equipments": [
                                            "8",
                                            "9"
                                        ],
                                        "active": true
                                    },
                                    {
                                        "id": "s2",
                                        "name": "Sector 2",
                                        "description": "Sector 2 description",
                                        "data": { },
                                        "equipments": [
                                            "10"
                                        ],
                                        "active": false
                                    }
                                ],
                                "equipments": [
                                    "13"
                                ]
                            },
                            {
                                "id": "5",
                                "name": "Service C",
                                "description": "Service C description",
                                "data": null,
                                "services": [
                                    {
                                        "id": "2",
                                        "name": "Service B",
                                        "description": "Service B description",
                                        "data": null,
                                        "services": [ ],
                                        "sectors": [
                                            {
                                                "id": "s5",
                                                "name": "Sector 5",
                                                "description": "Sector 5 description",
                                                "data": { },
                                                "equipments": [
                                                    "8",
                                                    "9"
                                                ],
                                                "active": true
                                            },
                                            {
                                                "id": "s6",
                                                "name": "Sector 6",
                                                "description": "Sector 6 description",
                                                "data": { },
                                                "equipments": [
                                                    "10"
                                                ],
                                                "active": true
                                            }
                                        ],
                                        "equipments": [
                                            "13"
                                        ]
                                    },
                                    {
                                        "id": "5",
                                        "name": "Service C",
                                        "description": "Service C description",
                                        "data": null,
                                        "services": [
                                            {
                                                "id": "2",
                                                "name": "Service B",
                                                "description": "Service B description",
                                                "data": null,
                                                "services": [ ],
                                                "sectors": [
                                                    {
                                                        "id": "s8",
                                                        "name": "Sector 8",
                                                        "description": "Sector 8 description",
                                                        "data": { },
                                                        "equipments": [
                                                            "8",
                                                            "9"
                                                        ],
                                                        "active": true
                                                    },
                                                    {
                                                        "id": "s9",
                                                        "name": "Sector 9",
                                                        "description": "Sector 9 description",
                                                        "data": { },
                                                        "equipments": [
                                                            "10"
                                                        ],
                                                        "active": true
                                                    }
                                                ],
                                                "equipments": [
                                                    "13"
                                                ]
                                            },
                                            {
                                                "id": "5",
                                                "name": "Service C",
                                                "description": "Service C description",
                                                "data": null,
                                                "services": [ ],
                                                "sectors": [
                                                    {
                                                        "id": "s10",
                                                        "name": "Sector 10",
                                                        "description": "Sector 10 description",
                                                        "data": { },
                                                        "equipments": [ ],
                                                        "active": true
                                                    },
                                                    {
                                                        "id": "s11",
                                                        "name": "Sector 11",
                                                        "description": "Sector 11 description",
                                                        "data": { },
                                                        "equipments": [
                                                            "11",
                                                            "12"
                                                        ],
                                                        "active": true
                                                    }
                                                ],
                                                "equipments": [
                                                    "13"
                                                ]
                                            }
                                        ],
                                        "sectors": [
                                            {
                                                "id": "s6_2",
                                                "name": "Sector 6_2",
                                                "description": "Sector 6_2 description",
                                                "data": { },
                                                "equipments": [ ],
                                                "active": true
                                            },
                                            {
                                                "id": "s7",
                                                "name": "Sector 7",
                                                "description": "Sector 7 description",
                                                "data": { },
                                                "equipments": [
                                                    "11",
                                                    "12"
                                                ],
                                                "active": true
                                            }
                                        ],
                                        "equipments": [
                                            "13"
                                        ]
                                    }
                                ],
                                "sectors": [
                                    {
                                        "id": "s3",
                                        "name": "Sector 3",
                                        "description": "Sector 3 description",
                                        "data": { },
                                        "equipments": [ ],
                                        "active": true
                                    },
                                    {
                                        "id": "s4",
                                        "name": "Sector 4",
                                        "description": "Sector 4 description",
                                        "data": { },
                                        "equipments": [
                                            "11",
                                            "12"
                                        ],
                                        "active": true
                                    }
                                ],
                                "equipments": [
                                    "13"
                                ]
                            }
                        ],
                        "sectors": [
                            {
                                "id": "s12",
                                "name": "Sector 12",
                                "description": "Sector 12 description",
                                "data": { },
                                "equipments": [
                                    "8",
                                    "9"
                                ],
                                "active": true
                            },
                            {
                                "id": "s13",
                                "name": "Sector 13",
                                "description": "Sector 13 description",
                                "data": { },
                                "equipments": [
                                    "10"
                                ],
                                "active": true
                            }
                        ],
                        "equipments": [
                            "13"
                        ]
                    },
                    {
                        "id": "5",
                        "name": "Service C",
                        "description": "Service C description",
                        "data": null,
                        "services": [
                            {
                                "id": "2",
                                "name": "Service B",
                                "description": "Service B description",
                                "data": null,
                                "services": [ ],
                                "sectors": [
                                    {
                                        "id": "s14",
                                        "name": "Sector 14",
                                        "description": "Sector 14 description",
                                        "data": { },
                                        "equipments": [
                                            "8",
                                            "9"
                                        ],
                                        "active": true
                                    },
                                    {
                                        "id": "s15",
                                        "name": "Sector 15",
                                        "description": "Sector 15 description",
                                        "data": { },
                                        "equipments": [
                                            "10"
                                        ],
                                        "active": true
                                    }
                                ],
                                "equipments": [
                                    "13"
                                ]
                            },
                            {
                                "id": "5",
                                "name": "Service C",
                                "description": "Service C description",
                                "data": null,
                                "services": [
                                    {
                                        "id": "2",
                                        "name": "Service B",
                                        "description": "Service B description",
                                        "data": null,
                                        "services": [ ],
                                        "sectors": [
                                            {
                                                "id": "s18",
                                                "name": "Sector 18",
                                                "description": "Sector 18 description",
                                                "data": { },
                                                "equipments": [
                                                    "8",
                                                    "9"
                                                ],
                                                "active": true
                                            },
                                            {
                                                "id": "s19",
                                                "name": "Sector 19",
                                                "description": "Sector 19 description",
                                                "data": { },
                                                "equipments": [
                                                    "10"
                                                ],
                                                "active": true
                                            }
                                        ],
                                        "equipments": [
                                            "13"
                                        ]
                                    },
                                    {
                                        "id": "5",
                                        "name": "Service C",
                                        "description": "Service C description",
                                        "data": null,
                                        "services": [
                                            {
                                                "id": "2",
                                                "name": "Service B",
                                                "description": "Service B description",
                                                "data": null,
                                                "services": [ ],
                                                "sectors": [
                                                    {
                                                        "id": "s22",
                                                        "name": "Sector 22",
                                                        "description": "Sector 22 description",
                                                        "data": { },
                                                        "equipments": [
                                                            "8",
                                                            "9"
                                                        ],
                                                        "active": true
                                                    },
                                                    {
                                                        "id": "s23",
                                                        "name": "Sector 23",
                                                        "description": "Sector 23 description",
                                                        "data": { },
                                                        "equipments": [
                                                            "10"
                                                        ],
                                                        "active": true
                                                    }
                                                ],
                                                "equipments": [
                                                    "13"
                                                ]
                                            },
                                            {
                                                "id": "5",
                                                "name": "Service C",
                                                "description": "Service C description",
                                                "data": null,
                                                "services": [ ],
                                                "sectors": [
                                                    {
                                                        "id": "s24",
                                                        "name": "Sector 24",
                                                        "description": "Sector 24 description",
                                                        "data": { },
                                                        "equipments": [ ],
                                                        "active": true
                                                    },
                                                    {
                                                        "id": "s25",
                                                        "name": "Sector 25",
                                                        "description": "Sector 25 description",
                                                        "data": { },
                                                        "equipments": [
                                                            "11",
                                                            "12"
                                                        ],
                                                        "active": true
                                                    }
                                                ],
                                                "equipments": [
                                                    "13"
                                                ]
                                            }
                                        ],
                                        "sectors": [
                                            {
                                                "id": "s20",
                                                "name": "Sector 20",
                                                "description": "Sector 20 description",
                                                "data": { },
                                                "equipments": [ ],
                                                "active": true
                                            },
                                            {
                                                "id": "s21",
                                                "name": "Sector 21",
                                                "description": "Sector 21 description",
                                                "data": { },
                                                "equipments": [
                                                    "11",
                                                    "12"
                                                ],
                                                "active": true
                                            }
                                        ],
                                        "equipments": [
                                            "13"
                                        ]
                                    }
                                ],
                                "sectors": [
                                    {
                                        "id": "s16",
                                        "name": "Sector 16",
                                        "description": "Sector 16 description",
                                        "data": { },
                                        "equipments": [ ],
                                        "active": true
                                    },
                                    {
                                        "id": "s17",
                                        "name": "Sector 17",
                                        "description": "Sector 17 description",
                                        "data": { },
                                        "equipments": [
                                            "11",
                                            "12"
                                        ],
                                        "active": true
                                    }
                                ],
                                "equipments": [
                                    "13"
                                ]
                            }
                        ],
                        "sectors": [
                            {
                                "id": "s26",
                                "name": "Sector 26",
                                "description": "Sector 26 description",
                                "data": { },
                                "equipments": [ ],
                                "active": null
                            },
                            {
                                "id": "s27",
                                "name": "Sector 27",
                                "description": "Sector 27 description",
                                "data": { },
                                "equipments": [
                                    "11",
                                    "12"
                                ],
                                "active": true
                            }
                        ],
                        "equipments": [
                            "13"
                        ]
                    }
                ],
                "sectors": [ ],
                "equipments": [ ]
            }
        ],
        "equipments": [
            {
                "id": "8",
                "name": "Equipment a",
                "description": "Equipment a description",
                "data": {
                    "Pressure": "2 bar",
                    "WaterTemperature": "+4C",
                    "Expense": "1000 m3",
                    "Status": "Opened",
                    "AirTemperature": "+20C"
                },
                "nature": "tank",
                "active": true,
                "coordinates": { }
            },
            {
                "id": "9",
                "name": "Equipment b",
                "description": "Equipment b description",
                "data": { },
                "nature": "tank",
                "active": false,
                "coordinates": { }
            },
            {
                "id": "10",
                "name": "Equipment c",
                "description": "Equipment c description",
                "data": {
                    "Pressure": "2.2 bar",
                    "WaterTemperature": "+5C",
                    "Expense": "2000 m3",
                    "Status": "Closed",
                    "AirTemperature": "+19C"
                },
                "nature": "tank",
                "active": true,
                "coordinates": { }
            },
            {
                "id": "11",
                "name": "Equipment d",
                "description": "Equipment d description",
                "data": { },
                "nature": "tank",
                "active": true,
                "coordinates": { }
            },
            {
                "id": "12",
                "name": "Equipment e",
                "description": "Equipment e description",
                "data": { },
                "nature": "tank",
                "active": true,
                "coordinates": { }
            },
            {
                "id": "13",
                "name": "Equipment f",
                "description": "Equipment f description",
                "data": { },
                "nature": "tank",
                "active": true,
                "coordinates": { }
            }
        ],
        "scheme": {
            "backgroundImage": "http://maps.googleapis.com/maps/api/staticmap?size=1024x768&zoom=15&center=48.852456,2.350216&Type=HYBRID&sensor=false",
            "background": null,
            "views": [
                {
                    "id": "12345",
                    "x": 431,
                    "y": 450,
                    "viewType": "EquipmentView",
                    "width": 216,
                    "height": 129,
                    "background": "#0c0",
                    "stroke": "#060",
                    "equipment": "10",
                    "title": {
                        "id": "123457",
                        "x": 37,
                        "y": -169,
                        "fontFamily": null,
                        "fontSize": null,
                        "color": "blue",
                        "bold": false,
                        "italic": false,
                        "underline": false
                    },
                    "icon": {
                        "id": "123456",
                        "x": 7,
                        "y": -163,
                        "width": 128,
                        "height": 128,
                        "url": "img/testIcon.png"
                    }
                },
                {
                    "id": "555555",
                    "x": 91,
                    "y": 415,
                    "points": [
                        -68,
                        -114,
                        278,
                        -162,
                        466,
                        132,
                        97,
                        154,
                        -75,
                        44
                    ],
                    "viewType": "PolygonView",
                    "stroke": "#cb0000",
                    "background": "#ff0000",
                    "sector": "s1"
                },
                {
                    "id": "secView1",
                    "x": 156,
                    "y": 362,
                    "viewType": "SectorView",
                    "width": 216,
                    "height": 129,
                    "background": "#0c0",
                    "stroke": "#060",
                    "sector": "s1",
                    "title": {
                        "id": "t2",
                        "x": 0,
                        "y": -5,
                        "fontFamily": null,
                        "fontSize": null,
                        "color": "blue",
                        "bold": false,
                        "italic": false,
                        "underline": false
                    }
                },
                {
                    "id": "textView1",
                    "x": 72,
                    "y": 599,
                    "viewType": "TitleView",
                    "fontFamily": null,
                    "fontSize": null,
                    "color": "#FFFF00",
                    "bold": false,
                    "italic": false,
                    "underline": false,
                    "text": "Good text for example"
                },
                {
                    "id": "223c5a90-534b-6524-6462-09efba50f11b",
                    "x": 411,
                    "y": 351,
                    "viewType": "LineView",
                    "background": "#000000",
                    "points": [
                        0,
                        0,
                        2,
                        306
                    ],
                    "width": null
                },
                {
                    "id": "2edb466f-aa96-63d4-0c06-ea0b9608e7d3",
                    "x": 79,
                    "y": 212,
                    "viewType": "LineView",
                    "background": "#000000",
                    "points": [
                        0,
                        0,
                        334,
                        141
                    ],
                    "width": null
                },
                {
                    "id": "77f068e7-5e41-62ca-c8ba-3719b9f7814a",
                    "x": 557,
                    "y": 274,
                    "viewType": "TitleView",
                    "fontFamily": "Times New Roman",
                    "fontSize": "16",
                    "color": "#000000",
                    "bold": false,
                    "italic": false,
                    "underline": false,
                    "text": "New text"
                },
                {
                    "id": "fcf5d2d7-a7f9-7cff-9dc8-9e53e512854a",
                    "x": 544,
                    "y": 230,
                    "points": [
                        -158,
                        22,
                        85,
                        -34,
                        168,
                        -139,
                        484,
                        17,
                        482,
                        488,
                        261,
                        486,
                        21,
                        315
                    ],
                    "viewType": "PolygonView",
                    "stroke": "#00cb00",
                    "background": "#00ff00",
                    "sector": "s5"
                },
                {
                    "id": "c0d12479-f70a-ec54-c80e-0b08247a0b75",
                    "x": 791,
                    "y": 567,
                    "viewType": "EquipmentView",
                    "width": 216,
                    "height": 129,
                    "background": "#ffffff",
                    "stroke": "#cbcbcb",
                    "equipment": "13",
                    "title": {
                        "id": "a4ad4dfc-9796-3be8-5764-f57301749b5f",
                        "x": 36,
                        "y": -154,
                        "fontFamily": null,
                        "fontSize": null,
                        "color": null,
                        "bold": false,
                        "italic": false,
                        "underline": false
                    },
                    "icon": {
                        "id": "f44f9718-bf86-1925-2097-51cd3d0de017",
                        "x": 13,
                        "y": -144,
                        "width": 128,
                        "height": 128,
                        "url": "img/testIcon.png"
                    }
                },
                {
                    "id": "bd38c8ce-d092-c1fa-eecd-df73b71c9381",
                    "x": 690,
                    "y": 202,
                    "viewType": "SectorView",
                    "width": 216,
                    "height": 129,
                    "background": "#ffffff",
                    "stroke": "#cbcbcb",
                    "sector": "s5",
                    "title": {
                        "id": "d9ce1318-003c-8709-7bee-796a49a49ddf",
                        "x": 0,
                        "y": -5,
                        "fontFamily": null,
                        "fontSize": null,
                        "color": null,
                        "bold": false,
                        "italic": false,
                        "underline": false
                    }
                },
                {
                    "id": "e414a406-5d53-f8ca-3c78-10027d7faaf9",
                    "x": 113,
                    "y": 130,
                    "points": [
                        -92,
                        -122,
                        918,
                        -118,
                        914,
                        100,
                        598,
                        -58,
                        503,
                        55,
                        248,
                        112,
                        -88,
                        162
                    ],
                    "viewType": "PolygonView",
                    "stroke": "#000dff",
                    "background": "#6b76f7",
                    "sector": "s2"
                },
                {
                    "id": "af84b1c1-5737-b489-20dc-7833a0f401e9",
                    "x": 47,
                    "y": 67,
                    "viewType": "SectorView",
                    "width": 216,
                    "height": 129,
                    "background": "#ffffff",
                    "stroke": "#cbcbcb",
                    "sector": "s2",
                    "title": {
                        "id": "b466685a-a44d-c3cb-d06d-92b33441624a",
                        "x": 1,
                        "y": -8,
                        "fontFamily": "Monotype Corsiva",
                        "fontSize": "20",
                        "color": null,
                        "bold": false,
                        "italic": false,
                        "underline": false
                    }
                },
                {
                    "id": "862cc9f2-16e5-abf5-e792-9c0a0801e15c",
                    "x": 469,
                    "y": 29,
                    "viewType": "EquipmentView",
                    "width": 216,
                    "height": 129,
                    "background": "#ffffff",
                    "stroke": "#cbcbcb",
                    "equipment": "8",
                    "title": {
                        "id": "9123f607-c8ef-f461-bef5-4e8135f7cfbb",
                        "x": -132,
                        "y": 6,
                        "fontFamily": "fantasy",
                        "fontSize": "18",
                        "color": null,
                        "bold": false,
                        "italic": false,
                        "underline": false
                    },
                    "icon": {
                        "id": "ffbb4259-1e99-0dff-c5fd-448fc5ea1968",
                        "x": -155,
                        "y": 16,
                        "width": 128,
                        "height": 128,
                        "url": "img/testIcon.png"
                    }
                },
                {
                    "id": "4c30eef8-9385-02e4-be8e-b5cfed5ee468",
                    "x": 412,
                    "y": 654,
                    "viewType": "LineView",
                    "background": "#000000",
                    "points": [
                        0,
                        0,
                        365,
                        0
                    ],
                    "width": 4
                }
            ]
        }
    }
}
;