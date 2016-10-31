/**
 * User: kiknadze
 * Date: 01.12.2015
 * Time: 18:39
 */
var ex1 = {
    data: {
        services: [{
            id: "1",
            name: "Service A",
            description: "Service A description",
            data: {},
            services: [{
                id: "2",
                name: "Service B",
                description: "Service B description",
                sectors: [{
                    id: "3",
                    name: "Sector 1",
                    description: "Sector 1 description",
                    data: {},
                    equipments: ["8", "9"]
                }, {
                    id: "4",
                    name: "Sector 2",
                    description: "Sector 2 description",
                    data: {},
                    equipments: ["10"]
                }]
            }, {
                id: "5",
                name: "Service C",
                description: "Service C description",
                sectors: [{
                    id: "6",
                    name: "Sector 3",
                    description: "Sector 3 description",
                    data: {},
                    equipments: []
                }, {
                    id: "7",
                    name: "Sector 4",
                    description: "Sector 4 description",
                    data: {},
                    equipments: ["11", "12"]
                }]
            }],
            sectors: []
        }],
        equipments: [
            {
            id: "8",
            name: "Equipment a",
            nature: "tank",
            coordinates: {},
            description: "Equipment a description",
            data: {}
        }, {
            id: "9",
            name: "Equipment b",
            nature: "tank",
            coordinates: {},
            description: "Equipment b description",
            data: {}
        }, {
            id: "10",
            name: "Equipment c",
            nature: "tank",
            coordinates: {},
            description: "Equipment c description",
            data: {}
        }, {
            id: "11",
            name: "Equipment d",
            nature: "tank",
            coordinates: {},
            description: "Equipment d description",
            data: {}
        }, {
            id: "12",
            name: "Equipment e",
            nature: "tank",
            coordinates: {},
            description: "Equipment e description",
            data: {}
        }]
    }
};