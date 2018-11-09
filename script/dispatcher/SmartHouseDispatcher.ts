import {SmartHouseStore } from "../stores/SmartHouseStore";
import {Dispatcher} from "../utils/fluxi/fluxi";

const SmartHouseDispatcher = new Dispatcher();
const store = new SmartHouseStore();

SmartHouseDispatcher.addListener("SMARTHOUSE_CARDS_TRANSITION", (action) => {
    store.addEventHandler(action.text);
    store.getCards();
    store.emitChange();

});
SmartHouseDispatcher.addListener("SMARTHOUSE_MULTIMEDIA_TRANSITION", (action) => {
    store.addEventHandler(action.text);
    store.getMultimedia();
    store.emitChange();
});

export default SmartHouseDispatcher;
