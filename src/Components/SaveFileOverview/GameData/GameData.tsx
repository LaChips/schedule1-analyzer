import { prettyNumber } from "../../../helpers/numbers";
import { SaveFile } from "../../../types/saveFile";

import styles from "./GameData.module.css";

type GameDataProps = {
    data: SaveFile;
}

const GameData = ({ data }: GameDataProps) => {
    const creationDate = new Date(data.gameData.game.creationDate);
    const lastPlayedDate = new Date(data.gameData.game.lastPlayedDate);
    return (
        <div className={styles.gameData}>
            <h1>Overview</h1>
            <div className={styles.gameDataContent}>
                <div className={styles.gameDataCategory}>
                    <span className={styles.categoryTitle}>Player</span>
                    <div className={styles.divider} />
                    <div className={styles.gameDataItemsContainer}>
                        <div className={styles.gameDataItem}>
                            <span className={styles.gameDataValue}>{data.gameData.player.rank}</span> <span className={styles.gameDataKey}>Rank</span>
                        </div>
                        <div className={styles.gameDataItem}>
                            <span className={styles.gameDataValue}>{data.gameData.player.tier}</span> <span className={styles.gameDataKey}>Tier</span>
                        </div>
                        <div className={styles.gameDataItem}>
                            <span className={styles.gameDataValue}>{data.gameData.player.xp}</span> <span className={styles.gameDataKey}>XP</span>
                        </div>
                        <div className={styles.gameDataItem}>
                            <span className={styles.gameDataValue}>{prettyNumber(data.gameData.player.totalXp)}</span> <span className={styles.gameDataKey}>Total XP</span>
                        </div>
                        <div className={styles.gameDataItem}>
                            <span className={styles.gameDataValue}>{prettyNumber(data.gameData.player.onlineBalance)}</span> <span className={styles.gameDataKey}>Online Balance</span>
                        </div>
                        <div className={styles.gameDataItem}>
                            <span className={styles.gameDataValue}>{prettyNumber(data.gameData.player.netWorth)}</span> <span className={styles.gameDataKey}>Net Worth</span>
                        </div>
                        <div className={styles.gameDataItem}>
                            <span className={styles.gameDataValue}>{prettyNumber(data.gameData.player.lifetimeEarnings)}</span> <span className={styles.gameDataKey}>Lifetime Earnings</span>
                        </div>
                    </div>
                </div>
                <div className={styles.gameDataCategory}>
                    <span className={styles.categoryTitle}>Game</span>
                    <div className={styles.divider} />
                    <div className={styles.gameDataItemsContainer}>
                        <div className={styles.gameDataItem}>
                            <span className={styles.gameDataValue}>{data.gameData.game.elapsedDays}</span> <span className={styles.gameDataKey}>Elapsed Days</span>
                        </div>
                        <div className={styles.gameDataItem}>
                            <span className={styles.gameDataValue}>{creationDate.toLocaleDateString()} {creationDate.toLocaleTimeString()}</span> <span className={styles.gameDataKey}>Creation Date</span>
                        </div>
                        <div className={styles.gameDataItem}>
                            <span className={styles.gameDataValue}>{lastPlayedDate.toLocaleDateString()} {lastPlayedDate.toLocaleTimeString()}</span> <span className={styles.gameDataKey}>Last Played Date</span>
                        </div>
                        <div className={styles.gameDataItem}>
                            <span className={styles.gameDataValue}>{data.gameData.game.seed}</span> <span className={styles.gameDataKey}>Seed</span>
                        </div>
                        <div className={styles.gameDataItem}>
                            <span className={styles.gameDataValue}>{data.gameData.game.organisationName}</span> <span className={styles.gameDataKey}>Organisation Name</span>
                        </div>
                        <div className={styles.gameDataItem}>
                            <span className={styles.gameDataValue}>{data.gameData.game.playtime}</span> <span className={styles.gameDataKey}>Playtime</span>
                        </div>
                    </div>
                </div>
                {/* <p><strong>Game:</strong></p>
                <p>Elapsed Days: {data.gameData.game.elapsedDays}</p>
                <p>Creation Date: {data.gameData.game.creationDate}</p>
                <p>Last Played Date: {data.gameData.game.lastPlayedDate}</p>
                <p>Seed: {data.gameData.game.seed}</p>
                <p>Organisation Name: {data.gameData.game.organisationName}</p>
                <p>Playtime: {data.gameData.game.playtime}</p> */}
            </div>
        </div>
    )
};

export default GameData;