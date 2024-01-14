var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { short } from "./link-shortener.js";
export function getLink(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield short(`https://profi.ru/backoffice/n.php?o=${id}&analytics_data=%7B%22source%22%3A%22new_board%22%2C%22board_order_index%22%3A4%2C%22board_item_index%22%3A5%2C%22board_search_used%22%3A0%2C%22board_search_query%22%3A%22%22%2C%22score%22%3A70%2C%22concept_board%22%3A0%2C%22case_id%22%3Anull%2C%22experiment_id%22%3A1063%7D`);
    });
}
