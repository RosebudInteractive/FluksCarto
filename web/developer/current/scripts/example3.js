/**
 * User: kiknadze
 * Date: 01.12.2015
 * Time: 18:39
 */
var ex3 = {
    data: {
        services: [
            {
                id: "1",
                name: "Service A",
                description: "Service A description",
                data: {},
                services: [
                    {
                        id: "1_1",
                        name: "Service B",
                        description: "Service B description",
                        services: [
                            {
                                id: "1_1_1",
                                name: "Service C",
                                description: "Service B description",
                                sectors: [
                                    {
                                        id: "s1",
                                        name: "Sector 1",
                                        description: "Sector 1 description",
                                        active: "#ff0000",
                                        data: {
                                            Temperature: 20,
                                            SomeData: "Custom data"
                                        },
                                        equipments: ["8", "9"]
                                    },
                                    {
                                        id: "s2",
                                        name: "Sector 2",
                                        description: "Sector 2 description",
                                        active: "#bcbcbc",
                                        data: {},
                                        equipments: ["10"]
                                    }
                                ],
                                equipments:["13"]
                            },
                            {
                                id: "5",
                                name: "Service C",
                                description: "Service C description",
                                sectors: [
                                    {
                                        id: "s3",
                                        name: "Sector 3",
                                        description: "Sector 3 description",
                                        active: "#ffff00",
                                        data: {},
                                        equipments: []
                                    },
                                    {
                                        id: "s4",
                                        name: "Sector 4",
                                        description: "Sector 4 description",
                                        active: "#ff0000",
                                        data: {},
                                        equipments: ["11", "12"]
                                    }
                                ],
                                services: [
                                    {
                                        id: "2",
                                        name: "Service B",
                                        description: "Service B description",
                                        sectors: [
                                            {
                                                id: "s5",
                                                name: "Sector 5",
                                                description: "Sector 5 description",
                                                active: "#ff0000",
                                                data: {},
                                                equipments: ["8", "9"]
                                            },
                                            {
                                                id: "s6",
                                                name: "Sector 6",
                                                description: "Sector 6 description",
                                                active: "#ff0000",
                                                data: {},
                                                equipments: ["10"]
                                            }
                                        ],
                                        equipments:["13"]
                                    },
                                    {
                                        id: "5",
                                        name: "Service C",
                                        description: "Service C description",
                                        sectors: [
                                            {
                                                id: "s6_2",
                                                name: "Sector 6_2",
                                                description: "Sector 6_2 description",
                                                active: "#ff0000",
                                                data: {},
                                                equipments: []
                                            },
                                            {
                                                id: "s7",
                                                name: "Sector 7",
                                                description: "Sector 7 description",
                                                active: "#ff0000",
                                                data: {},
                                                equipments: ["11", "12"]
                                            }
                                        ],
                                        services: [
                                            {
                                                id: "2",
                                                name: "Service B",
                                                description: "Service B description",
                                                sectors: [
                                                    {
                                                        id: "s8",
                                                        name: "Sector 8",
                                                        description: "Sector 8 description",
                                                        active: "#ff0000",
                                                        data: {},
                                                        equipments: ["8", "9"]
                                                    },
                                                    {
                                                        id: "s9",
                                                        name: "Sector 9",
                                                        description: "Sector 9 description",
                                                        active: "#ff0000",
                                                        data: {},
                                                        equipments: ["10"]
                                                    }
                                                ],
                                                equipments:["13"]
                                            },
                                            {
                                                id: "5",
                                                name: "Service C",
                                                description: "Service C description",
                                                sectors: [
                                                    {
                                                        id: "s10",
                                                        name: "Sector 10",
                                                        description: "Sector 10 description",
                                                        active: "#ff0000",
                                                        data: {},
                                                        equipments: []
                                                    },
                                                    {
                                                        id: "s11",
                                                        name: "Sector 11",
                                                        description: "Sector 11 description",
                                                        active: "#ff0000",
                                                        data: {},
                                                        equipments: ["11", "12"]
                                                    }
                                                ],
                                                equipments:["13"]
                                            }
                                        ],
                                        equipments:["13"]
                                    }
                                ],
                                equipments:["13"]
                            }
                        ],
                        sectors: [
                            {
                                id: "s12",
                                name: "Sector 12",
                                description: "Sector 12 description",
                                active: "#ff0000",
                                data: {},
                                equipments: ["8", "9"]
                            },
                            {
                                id: "s13",
                                name: "Sector 13",
                                description: "Sector 13 description",
                                active: "#ff0000",
                                data: {},
                                equipments: ["10"]
                            }
                        ],
                        equipments:["13"]
                    },
                    {
                        id: "5",
                        name: "Service C",
                        description: "Service C description",
                        services: [
                            {
                                id: "2",
                                name: "Service B",
                                description: "Service B description",
                                sectors: [
                                    {
                                        id: "s14",
                                        name: "Sector 14",
                                        description: "Sector 14 description",
                                        active: "#ff00ff",
                                        data: {},
                                        equipments: ["8", "9"]
                                    },
                                    {
                                        id: "s15",
                                        name: "Sector 15",
                                        description: "Sector 15 description",
                                        active: "#ff00ff",
                                        data: {},
                                        equipments: ["10"]
                                    }
                                ],
                                equipments:["13"]
                            },
                            {
                                id: "5",
                                name: "Service C",
                                description: "Service C description",
                                sectors: [
                                    {
                                        id: "s16",
                                        name: "Sector 16",
                                        description: "Sector 16 description",
                                        active: "#ff00ff",
                                        data: {},
                                        equipments: []
                                    },
                                    {
                                        id: "s17",
                                        name: "Sector 17",
                                        description: "Sector 17 description",
                                        active: "#ff00ff",
                                        data: {},
                                        equipments: ["11", "12"]
                                    }
                                ],
                                services: [
                                    {
                                        id: "2",
                                        name: "Service B",
                                        description: "Service B description",
                                        sectors: [
                                            {
                                                id: "s18",
                                                name: "Sector 18",
                                                description: "Sector 18 description",
                                                active: "#ff00ff",
                                                data: {},
                                                equipments: ["8", "9"]
                                            },
                                            {
                                                id: "s19",
                                                name: "Sector 19",
                                                description: "Sector 19 description",
                                                active: "#ff00ff",
                                                data: {},
                                                equipments: ["10"]
                                            }
                                        ],
                                        equipments:["13"]
                                    },
                                    {
                                        id: "5",
                                        name: "Service C",
                                        description: "Service C description",
                                        sectors: [
                                            {
                                                id: "s20",
                                                name: "Sector 20",
                                                description: "Sector 20 description",
                                                active: "#ff00ff",
                                                data: {},
                                                equipments: []
                                            },
                                            {
                                                id: "s21",
                                                name: "Sector 21",
                                                description: "Sector 21 description",
                                                active: "#ff00ff",
                                                data: {},
                                                equipments: ["11", "12"]
                                            }
                                        ],
                                        services: [
                                            {
                                                id: "2",
                                                name: "Service B",
                                                description: "Service B description",
                                                sectors: [
                                                    {
                                                        id: "s22",
                                                        name: "Sector 22",
                                                        description: "Sector 22 description",
                                                        active: "#ff00ff",
                                                        data: {},
                                                        equipments: ["8", "9"]
                                                    },
                                                    {
                                                        id: "s23",
                                                        name: "Sector 23",
                                                        description: "Sector 23 description",
                                                        active: "#ff00ff",
                                                        data: {},
                                                        equipments: ["10"]
                                                    }
                                                ],
                                                equipments:["13"]
                                            },
                                            {
                                                id: "5",
                                                name: "Service C",
                                                description: "Service C description",
                                                sectors: [
                                                    {
                                                        id: "s24",
                                                        name: "Sector 24",
                                                        description: "Sector 24 description",
                                                        active: "#ff00ff",
                                                        data: {},
                                                        equipments: []
                                                    },
                                                    {
                                                        id: "s25",
                                                        name: "Sector 25",
                                                        description: "Sector 25 description",
                                                        active: "#ff00ff",
                                                        data: {},
                                                        equipments: ["11", "12"]
                                                    }
                                                ],
                                                equipments:["13"]
                                            }
                                        ],
                                        equipments:["13"]
                                    }
                                ],
                                equipments:["13"]
                            }
                        ],
                        sectors: [
                            {
                                id: "s26",
                                name: "Sector 26",
                                description: "Sector 26 description",
                                data: {},
                                equipments: []
                            },
                            {
                                id: "s27",
                                name: "Sector 27",
                                description: "Sector 27 description",
                                active: "#ff00ff",
                                data: {},
                                equipments: ["11", "12"]
                            }
                        ],
                        equipments:["13"]
                    }
                ],
                sectors: []
            }],
        equipments: [
            {
                id: "8",
                name: "Equipment a",
                nature: "Tank",
                coordinates: {},
                description: "Equipment a description",
                active: "#ff0000",
                data: {
                    Pressure: "2 bar",
                    WaterTemperature: "+4C",
                    Expense: "1000 m3",
                    Status: "Opened",
                    AirTemperature: "+20C"
                }
            },
            {
                id: "9",
                name: "Equipment b",
                nature: "Camera",
                coordinates: {},
                description: "Equipment b description",
                active: false,
                data: {}
            },
            {
                id: "10",
                name: "Equipment c",
                nature: "Tank",
                coordinates: {},
                description: "Equipment c description",
                active: "#ff0000",
                data: {
                    Pressure: "2.2 bar",
                    WaterTemperature: "+5C",
                    Expense: "2000 m3",
                    Status: "Closed",
                    AirTemperature: "+19C"
                }
            },
            {
                id: "11",
                name: "Equipment d",
                nature: "Termometer",
                coordinates: {},
                description: "Equipment d description",
                active: "#ff0000",
                data: {}
            },

            {
                id: "12",
                name: "Equipment e",
                nature: "Sensor",
                coordinates: {},
                description: "Equipment e description",
                active: "#ff0000",
                data: {}
            },
            {
                id: "13",
                name: "Equipment f",
                nature: "Tank",
                coordinates: {},
                description: "Equipment f description",
                active: "#ff0000",
                data: {}
            }
        ],
        natures: {
            Tank: "img/Water Tower-48.png",
            Camera: "img/Video Call-52.png",
            Termometer: "img/Thermometer Automation Filled-50.png",
            Sensor: "img/Sensor-50.png"
        }
    }
};