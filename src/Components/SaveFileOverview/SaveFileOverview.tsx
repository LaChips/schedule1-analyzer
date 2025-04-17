

import { SaveFile } from "../../types/saveFile";
import GameData from "./GameData";
import styles from "./SaveFileOverview.module.css";

type SaveFileOverviewProps = {
    data: SaveFile;
}

const SaveFileOverview = ({
    data
}: SaveFileOverviewProps) => {
    return (
        <div className={styles.saveFileOverview}>
            <GameData data={data} />
        </div>
    )
};

export default SaveFileOverview;