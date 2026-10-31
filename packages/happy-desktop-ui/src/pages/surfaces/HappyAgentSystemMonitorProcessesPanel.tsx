import { translate } from "../../localization/translate";
import type {
    HappyAgentSystemMonitorSnapshot,
    HappyAgentSystemMonitorProcessColumn,
} from "happy-desktop-state";
import { TextField } from "../../TextField";
import { Icon } from "../../Icon";
import { SystemMonitorAsciiMeter, SystemMonitorProcessSpark } from "./systemMonitorGraphics";
import {
    systemMonitorBytes,
    systemMonitorPercent,
    systemMonitorRatio,
} from "./systemMonitorFormat";

export interface HappyAgentSystemMonitorProcessesPanelProps {
    monitor: HappyAgentSystemMonitorSnapshot;
    onProcessFilterChange: (value: string) => void;
    onProcessSortChange: (column: HappyAgentSystemMonitorProcessColumn) => void;
}

const COLUMNS: readonly { column: HappyAgentSystemMonitorProcessColumn; label: string }[] = [
    { column: "pid", label: "PID" },
    { column: "name", label: translate("Name") },
    { column: "user", label: translate("User") },
    { column: "cpu", label: translate("CPU") },
    { column: "memory", label: translate("Memory") },
    { column: "state", label: translate("State") },
    { column: "threads", label: translate("Threads") },
];

/** A controlled process list: its store owns ordering, filter, and bounded PID histories. */
export function HappyAgentSystemMonitorProcessesPanel(
    props: HappyAgentSystemMonitorProcessesPanelProps,
) {
    const { sample, processFilter, processSort, processRows } = props.monitor;
    const processes = sample?.processes;
    return (
        <section
            className="system-monitor__process-panel"
            data-happy-desktop-ui="system-monitor-processes"
        >
            <div className="system-monitor__process-toolbar">
                <div className="system-monitor__process-heading">
                    <h2>{translate("Processes")}</h2>
                    <span>
                        {processes
                            ? translate(
                                  "{0} processes{1}",
                                  processes.total.toLocaleString("en-US"),
                                  processes.threads === null
                                      ? ""
                                      : ` · ${processes.threads.toLocaleString("en-US")} threads`,
                              )
                            : translate("Live tasks on this machine")}
                        {processes && props.monitor.status !== "ready"
                            ? translate(" · Last sample")
                            : ""}
                    </span>
                </div>
                <TextField
                    aria-label={translate("Filter processes")}
                    type="search"
                    leadingIcon="search"
                    placeholder={translate("Filter processes…")}
                    value={processFilter}
                    onValueChange={props.onProcessFilterChange}
                    size="small"
                />
            </div>
            {processes == null ? (
                <div className="system-monitor__process-empty">
                    <span className="system-monitor__ascii-muted" aria-hidden="true">
                        [ · · · ]
                    </span>
                    <strong>
                        {sample
                            ? translate("Process metrics unavailable")
                            : translate("Waiting for processes")}
                    </strong>
                    <p>
                        {sample
                            ? translate(
                                  "This machine is not reporting its process list. Other resource metrics remain live.",
                              )
                            : translate("The live task list will appear with the first sample.")}
                    </p>
                </div>
            ) : (
                <>
                    <div
                        className="system-monitor__process-table"
                        role="table"
                        aria-label={translate("Live processes")}
                        aria-rowcount={processRows.length + 1}
                    >
                        <div role="rowgroup" className="system-monitor__process-header">
                            <div
                                className="system-monitor__process-row system-monitor__process-columns"
                                role="row"
                            >
                                {COLUMNS.map(({ column, label }) => (
                                    <div
                                        className={`system-monitor__process-cell system-monitor__process-${column}`}
                                        role="columnheader"
                                        key={column}
                                        aria-sort={
                                            column === processSort.column
                                                ? processSort.direction
                                                : "none"
                                        }
                                    >
                                        <button onClick={() => props.onProcessSortChange(column)}>
                                            {label}
                                            {processSort.column === column ? (
                                                <Icon
                                                    name={
                                                        processSort.direction === "descending"
                                                            ? "chevron-down"
                                                            : "chevron-up"
                                                    }
                                                    size={12}
                                                />
                                            ) : null}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div role="rowgroup">
                            {processRows.map(({ process, cpuHistory }) => (
                                <div
                                    className="system-monitor__process-row"
                                    role="row"
                                    key={process.pid}
                                    data-process-pid={process.pid}
                                >
                                    <div
                                        role="cell"
                                        className="system-monitor__process-cell system-monitor__process-pid"
                                    >
                                        {process.pid}
                                    </div>
                                    <div
                                        role="cell"
                                        className="system-monitor__process-cell system-monitor__process-name"
                                        title={process.name}
                                    >
                                        <span className="system-monitor__process-label">
                                            {process.name}
                                        </span>
                                    </div>
                                    <div
                                        role="cell"
                                        className="system-monitor__process-cell system-monitor__process-user"
                                        title={process.user ?? undefined}
                                    >
                                        <span className="system-monitor__process-label">
                                            {process.user ?? "—"}
                                        </span>
                                    </div>
                                    <div
                                        role="cell"
                                        className="system-monitor__process-cell system-monitor__process-cpu"
                                    >
                                        <div className="system-monitor__process-reading">
                                            <SystemMonitorAsciiMeter
                                                value={process.cpuPercent}
                                                label={translate("{0} CPU usage", process.name)}
                                                compact
                                            />
                                            <span>{systemMonitorPercent(process.cpuPercent)}</span>
                                        </div>
                                        <SystemMonitorProcessSpark
                                            values={cpuHistory}
                                            label={translate("{0} CPU history", process.name)}
                                        />
                                    </div>
                                    <div
                                        role="cell"
                                        className="system-monitor__process-cell system-monitor__process-memory"
                                    >
                                        <span>{systemMonitorBytes(process.memoryBytes)}</span>
                                        <SystemMonitorAsciiMeter
                                            value={
                                                sample
                                                    ? systemMonitorRatio(
                                                          process.memoryBytes,
                                                          sample.memory.totalBytes,
                                                      )
                                                    : null
                                            }
                                            label={translate(
                                                "{0} physical memory share",
                                                process.name,
                                            )}
                                            compact
                                        />
                                    </div>
                                    <div
                                        role="cell"
                                        className="system-monitor__process-cell system-monitor__process-state"
                                    >
                                        {process.state ?? "—"}
                                    </div>
                                    <div
                                        role="cell"
                                        className="system-monitor__process-cell system-monitor__process-threads"
                                    >
                                        {process.threads ?? "—"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {processRows.length === 0 ? (
                        <div className="system-monitor__process-empty">
                            <strong>
                                {processFilter.trim()
                                    ? translate("No matching processes")
                                    : translate("No processes reported")}
                            </strong>
                            <p>
                                {processFilter.trim()
                                    ? translate("Try a different name, user, state, or PID.")
                                    : translate(
                                          "New processes appear automatically as the machine reports them.",
                                      )}
                            </p>
                        </div>
                    ) : null}
                    <div className="system-monitor__process-footer">
                        <span>
                            {processRows.length} {translate("of")} {processes.items.length}
                            {translate("sampled · Top CPU and memory consumers")}
                        </span>
                        <span>
                            {translate(
                                "CPU is a share of the whole machine · Order updates every 5s",
                            )}
                        </span>
                    </div>
                </>
            )}
        </section>
    );
}
