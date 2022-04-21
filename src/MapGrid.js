import {Grid} from "pathfinding";
import {GRID_COLUMN_NUM, GRID_ROW_NUM} from "./constant";


export default class MapGrid {

    static initGrid=()=>{
        this.grid = new Grid(GRID_COLUMN_NUM, GRID_ROW_NUM);
    }

    static getGrid = () => {
        return this.grid;
    }
}
