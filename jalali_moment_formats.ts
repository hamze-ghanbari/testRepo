import { MatDateFormats } from "@angular/material/core";

export const JALALI_MOMENT_FORMATS: MatDateFormats = {
  parse: {
    dateInput: "jYYYY/jMM/jDD"
  },
  display: {
    dateInput: "jYYYY/jMM/jDD",
    monthYearLabel: "jMMMM jYYYY",
    dateA11yLabel: "jYYYY/jMM/jDD",
    monthYearA11yLabel: "jMMMM jYYYY"
  }
};

export const MOMENT_FORMATS: MatDateFormats = {
  parse: {
    dateInput: "0"
  },
  display: {
    dateInput: "0",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY"
  }
};