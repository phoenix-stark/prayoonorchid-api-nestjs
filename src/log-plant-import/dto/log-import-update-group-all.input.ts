export class LogImportUpdateGroupAllInput {
  token: string;
  filter: {
    code: string;
    isMatchAllCode: boolean;
    name: string;
    isMatchAllName: boolean;
    familyMain: string;
    isMatchAllFamilyMain: boolean;
    customer: string;
    isMatchAllCustomer: boolean;
    importStart: string;
    importEnd: string;
    mainTask: string;
    workType: string;
    food: string;
    isMatchAllFood: boolean;
    employee: string;
    reason: string;
    removeStart: string;
    removeEnd: string;
    removeDate: string;
    plantRemoveTypeId: string;
  };
  remove_date: string;
  plant_remove_type_id: number;
  receipt_id: string;
  remark: string;
  time_per_day: number;
}
/*
{
  "filters": [
    {
      "id": "plantName",
      "value": {
        "data": {
          "id": "",
          "description": ""
        },
        "is_match_all": false
      }
    },
    {
      "id": "plantCode",
      "value": {
        "data": {
          "id": "",
          "description": ""
        },
        "is_match_all": false
      }
    },
    {
      "id": "familyMain",
      "value": {
        "data": {
          "id": "",
          "description": ""
        },
        "is_match_all": false
      }
    },
    {
      "id": "workType",
      "value": {
        "data": {
          "id": "",
          "description": ""
        },
        "is_match_all": false
      }
    },
    {
      "id": "food",
      "value": {
        "data": {
          "id": "",
          "description": ""
        },
        "is_match_all": false
      }
    },
    {
      "id": "customer",
      "value": {
        "data": {
          "id": "",
          "description": ""
        },
        "is_match_all": false
      }
    },
    {
      "id": "employee",
      "value": {
        "data": {
          "id": "",
          "description": ""
        },
        "is_match_all": false
      }
    },
    {
      "id": "mainTask",
      "value": {
        "data": {
          "id": "",
          "description": ""
        },
        "is_match_all": false
      }
    },
    {
      "id": "importStartDate",
      "value": {
        "data": {
          "id": "",
          "description": "2025-01-06"
        },
        "is_match_all": true
      }
    },
    {
      "id": "importEndDate",
      "value": {
        "data": {
          "id": "",
          "description": "2025-01-07"
        },
        "is_match_all": true
      }
    },
    {
      "id": "reason",
      "value": {
        "data": {
          "id": "",
          "description": ""
        },
        "is_match_all": true
      }
    },
    {
      "id": "exportStartDate",
      "value": {
        "data": {
          "id": "",
          "description": "2025-01-06"
        },
        "is_match_all": true
      }
    },
    {
      "id": "exportEndDate",
      "value": {
        "data": {
          "id": "",
          "description": "2025-01-07"
        },
        "is_match_all": true
      }
    }
  ],
  "plant_remove_type_id": 1,
  "reciept_id": "",
  "remark": "",
  "remove_date": "2025-01-06",
  "time_per_day": "1",
  "token": "9e33bef19b7c08cb32fbf12c5e31157aa703b6fcbfb8953f2cf3c9f68b1e7ef9b57e2e33d98bf2c25412624d70e0aecf8c51e5bbd712459bce5aaec789d683de96187bb60a84dbf14d355d51d15b8e1510f098bf795c0b0d2a1d2a19501746f3f9a2df8f"
}
*/
