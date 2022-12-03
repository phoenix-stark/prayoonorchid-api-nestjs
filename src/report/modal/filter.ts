import { IsNotEmpty, IsNumber } from 'class-validator';

export class FilterObject {
  filter: [
    {
      plant_name: {
        id: string;
        description: string;
        is_match_all: boolean;
      };
    },
    {
      plant_code: {
        id: string;
        description: string;
        is_match_all: boolean;
      };
    },
    {
      family_main: {
        id: string;
        description: string;
        is_match_all: boolean;
      };
    },
    {
      work_type: {
        id: string;
        description: string;
        is_match_all: boolean;
      };
    },
    {
      food: {
        id: string;
        description: string;
        is_match_all: boolean;
      };
    },
    {
      customer: {
        id: string;
        description: string;
        is_match_all: boolean;
      };
    },
    {
      employee: {
        id: string;
        description: string;
        is_match_all: boolean;
      };
    },
    {
      main_task: {
        id: string;
        description: string;
        is_match_all: boolean;
      };
    },
    {
      import_start_date: {
        id: string;
        description: string;
        is_match_all: boolean;
      };
    },
    {
      import_end_date: {
        id: string;
        description: string;
        is_match_all: boolean;
      };
    },
    {
      reason_remove_type: {
        id: string;
        description: string;
        is_match_all: boolean;
      };
    },
    {
      main_task_multiple: {
        id: string;
        description: any[];
        is_match_all: boolean;
      };
    },
  ];
}
