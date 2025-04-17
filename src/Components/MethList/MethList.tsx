
import { useCallback, useMemo, useState } from "react";
import { MethType } from "../../types/variety";
import styles from "./MethList.module.css";

type MethListProps = {
  methTypes: MethType[];
};

const pseudoType: Record<string, {cost: number }> = {
  "Low Quality": { cost: 60 },
  "Standard Quality": { cost: 80 },
  "High Quality": { cost: 100 },
} as const;

const MethList = ({ methTypes }: MethListProps) => {
  const [pseudo, setPseudo] = useState("Standard Quality");
  const [sortBy, setSortBy] = useState("profitPerCrystal");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const handleSort = useCallback((key: string) => {
    setSortBy(key);
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  }, []);

  const totalPages = useMemo(() => {
    return Math.ceil(methTypes.length / itemsPerPage);
  }, [methTypes.length, itemsPerPage]);

  const computedVarieties = useMemo(() => {
    const newVarieties = methTypes.map((v: MethType) => {
      const totalCost =
        (v.ingredientCost * 8) +
        pseudoType[pseudo].cost;
      
			const totalProfit = (v.crystalPrice || 0) * 8;
      const profitPerBatch = totalProfit - totalCost;
      const profitPerCrystal = profitPerBatch / 8;
      const ratioCostBenefit = totalProfit / totalCost;
      const timePerBatch = (6 * v.mixSteps.length * 8) / 60;
      const profitPerDay = (24 / (timePerBatch || 1)) * profitPerBatch;
      return { ...v, totalCost, profitPerBatch, profitPerCrystal, ratioCostBenefit, timePerBatch, profitPerDay };
    });
		return newVarieties;
  }, [pseudo, methTypes]);

  const sortedVarieties = useMemo(
    () =>
      [...computedVarieties].sort((a, b) => {
        if (sortBy === 'mixSteps') {
          if (sortOrder === "asc") {
            return (a.mixSteps.length || 0) - (b.mixSteps.length || 0);
          }
          return (b.mixSteps.length || 0) - (a.mixSteps.length || 0);
        }
        const valueA = a[sortBy as keyof Exclude<typeof a, 'mixSteps'>] || 0;
        const valueB = b[sortBy as keyof Exclude<typeof b, 'mixSteps'>] || 0;
        if (typeof valueA === "string" && typeof valueB === "string") {
          return sortOrder === "desc"
            ? valueB.localeCompare(valueA)
            : valueA.localeCompare(valueB);
        }
        if (typeof valueA !== "number" || typeof valueB !== "number") {
          return 0;
        }
        return sortOrder === "desc" ? valueB - valueA : valueA - valueB;
      }),
    [computedVarieties, sortBy, sortOrder]
  );

  const paginatedVarieties = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedVarieties.slice(startIndex, endIndex);
  }
  , [currentPage, itemsPerPage, sortedVarieties]);
  
  return (
    <div>
      <select
        value={pseudo}
        onChange={(e) => setPseudo(e.target.value)}
      >
        {Object.keys(pseudoType).map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {sortedVarieties.length > 4 && (
        <div className={styles.varietyListHeader}>
          <span>Here are your best meth mixes.</span>
        </div>
      )}
      <table className={styles.table}>
        <thead>
          <tr className={styles.headerRow}>
            <th className={`${styles.tableCell} ${styles.name}`} onClick={() => handleSort("name")}>
              Name
              <span className={styles.sortIcon}>
                {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
              </span>
            </th>
            <th className={styles.tableCell} onClick={() => handleSort("crystalPrice")}>Crystal Price<span className={styles.sortIcon}>
                {sortBy === "crystalPrice" && (sortOrder === "asc" ? "↑" : "↓")}
              </span></th>
            <th className={styles.tableCell} onClick={() => handleSort("mixSteps")}>Mix Steps<span className={styles.sortIcon}>
                {sortBy === "mixSteps" && (sortOrder === "asc" ? "↑" : "↓")}
              </span></th>
            <th className={styles.tableCell} onClick={() => handleSort("ingredientCost")}>Ingredient Cost<span className={styles.sortIcon}>
                {sortBy === "ingredientCost" && (sortOrder === "asc" ? "↑" : "↓")}
              </span></th>
            <th className={styles.tableCell} onClick={() => handleSort("totalCost")}>Total Cost<span className={styles.sortIcon}>
                {sortBy === "totalCost" && (sortOrder === "asc" ? "↑" : "↓")}
              </span></th>
            <th className={styles.tableCell} onClick={() => handleSort("profitPerCrystal")}>Profit per crystal<span className={styles.sortIcon}>
                {sortBy === "profitPerCrystal" && (sortOrder === "asc" ? "↑" : "↓")}
              </span></th>
            <th className={styles.tableCell} onClick={() => handleSort("profitPerBatch")}>Profit per batch<span className={styles.sortIcon}>
                {sortBy === "profitPerBatch" && (sortOrder === "asc" ? "↑" : "↓")}
              </span></th>
            <th className={styles.tableCell} onClick={() => handleSort("ratioCostBenefit")}>Ratio Cost/Benefit<span className={styles.sortIcon}>
                {sortBy === "ratioCostBenefit" && (sortOrder === "asc" ? "↑" : "↓")}
              </span>
            </th>
            <th className={styles.tableCell} onClick={() => handleSort("timePerBatch")}>Time per batch<span className={styles.sortIcon}>
                {sortBy === "timePerBatch" && (sortOrder === "asc" ? "↑" : "↓")}
              </span>
            </th>
            <th className={styles.tableCell} onClick={() => handleSort("profitPerDay")}>Profit per day<span className={styles.sortIcon}>
                {sortBy === "profitPerDay" && (sortOrder === "asc" ? "↑" : "↓")}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedVarieties.map((v) => (
            <tr key={v.name} className={styles.tableRow}>
              <td className={`${styles.tableCell} ${styles.name}`}>{v.name}
              </td>
              <td className={styles.tableCell}>${v.crystalPrice}
              </td>
              <td className={styles.tableCell}>{v.mixSteps.length || 0}
              </td>
              <td className={styles.tableCell}>${v.ingredientCost}
              </td>
              <td className={styles.tableCell}>{v.totalCost}
              </td>
              <td className={styles.tableCell}>
                  ${v.profitPerCrystal.toFixed(3)}
                
              </td>
              <td className={styles.tableCell}>
                  ${v.profitPerBatch.toFixed(3)}
                
              </td>
              <td className={styles.tableCell}>
                  {v.ratioCostBenefit.toFixed(3)}
              </td>
              <td className={styles.tableCell}>
                  {parseInt(`${v.timePerBatch}`)}h{Math.round((v.timePerBatch % 1) * 60)}m
              </td>
              <td className={styles.tableCell}>
                  ${v.profitPerDay.toFixed(3)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.paginationContainer}>
        <div className={styles.paginationInfo}>
          <span>
            Showing {paginatedVarieties.length} of {sortedVarieties.length} meth mixes
          </span>
        </div>
        <div className={styles.pagination}>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
        <div className={styles.itemsPerPage}>
          <label>
            Items per page:
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              {[5, 10, 20, 50].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  )
};

export default MethList;