import { ListArg } from "@/services/types";

export interface LeadsFilter extends ListArg {
  creaded_by?: string;
}
