import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Code2,
  ExternalLink,
  FileText,
  GitBranch,
  Globe,
  LockKeyhole,
  Mail,
  Search,
  ShieldCheck,
  Terminal,
  Wifi,
} from "lucide-react";
import {
  isExpectedObservation,
  normalizeCommand,
  parseLabUrl,
  runCommand,
} from "../lib/simulator";
import "./LabTools.css";

type Props = {
  tool: string;
  command: string;
  target: string;
  onEvidence: (command: string) => void;
  completed: boolean;
};
type Line = { command?: string; output: string; valid?: boolean };

export default function LabTools(props: Props) {
  return (
    <div className="lab-workspace" key={`${props.tool}-${props.command}`}>
      <ToolExperience {...props} />
    </div>
  );
}

function ToolExperience({
  tool,
  command,
  target,
  onEvidence,
  completed,
}: Props) {
  const [recorded, setRecorded] = useState(completed);
  function record() {
    setRecorded(true);
    onEvidence(command);
  }
  const names: Record<string, string> = {
    terminal: "Field terminal",
    browser: "Relay browser",
    shodan: "Exposure index",
    cve: "Vulnerability intelligence",
    github: "Source explorer",
    wireshark: "Traffic analyzer",
    inbox: "Meridian mail",
    report: "Case notebook",
  };
  const icons: Record<string, typeof Terminal> = {
    terminal: Terminal,
    browser: Globe,
    shodan: Search,
    cve: ShieldCheck,
    github: GitBranch,
    wireshark: Wifi,
    inbox: Mail,
    report: FileText,
  };
  const Icon = icons[tool] || Terminal;
  return (
    <>
      <div className="lab-window-bar">
        <div className="lab-window-name">
          <Icon size={15} />
          <span>{names[tool] || "Field terminal"}</span>
        </div>
        <span className="lab-sim-tag">
          <i /> SIMULATED ENVIRONMENT
        </span>
      </div>
      {tool === "terminal" ? (
        <TerminalTool
          command={command}
          target={target}
          onEvidence={onEvidence}
        />
      ) : tool === "browser" ? (
        <BrowserTool command={command} record={record} recorded={recorded} />
      ) : tool === "shodan" ? (
        <ExposureTool record={record} recorded={recorded} />
      ) : tool === "cve" ? (
        <CveTool record={record} recorded={recorded} />
      ) : tool === "github" ? (
        <SourceTool record={record} recorded={recorded} />
      ) : tool === "wireshark" ? (
        <TrafficTool command={command} record={record} recorded={recorded} />
      ) : tool === "inbox" ? (
        <InboxTool record={record} recorded={recorded} />
      ) : (
        <ReportTool command={command} record={record} recorded={recorded} />
      )}
    </>
  );
}

function useObserved(
  condition: boolean,
  record: () => void,
  recorded: boolean,
) {
  useEffect(() => {
    if (condition && !recorded) record();
  }, [condition, record, recorded]);
}

function EvidenceButton({
  recorded,
  onClick,
  children,
  interactive = false,
}: {
  recorded: boolean;
  onClick: () => void;
  children: ReactNode;
  interactive?: boolean;
}) {
  if (!interactive)
    return (
      <div className="lab-observed" role="status">
        <Check size={14} />
        {recorded
          ? "Mira can see this finding."
          : "Mira is following your investigation."}
      </div>
    );
  return (
    <button
      type="button"
      className={`lab-action ${recorded ? "lab-recorded" : ""}`}
      onClick={onClick}
      disabled={recorded}
    >
      {recorded ? <Check size={15} /> : <FileText size={15} />}{" "}
      {recorded ? "Evidence added to case" : children}
      {!recorded && <ArrowRight size={15} />}
    </button>
  );
}

function TerminalTool({
  command,
  target,
  onEvidence,
}: Pick<Props, "command" | "target" | "onEvidence">) {
  const [lines, setLines] = useState<Line[]>([
    {
      output:
        "MERIDIAN FIELD SYSTEMS  /  secure training shell\nConnected to your isolated case workspace. Type help to explore.",
    },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [lines]);
  function execute(event: FormEvent) {
    event.preventDefault();
    const entered = input.trim();
    if (!entered) return;
    const result = runCommand(entered, target);
    if (normalizeCommand(entered) === "clear") setLines([]);
    else setLines((previous) => [...previous, { command: entered, ...result }]);
    if (result.valid && isExpectedObservation(entered, command))
      onEvidence(command);
    setHistory((previous) => [...previous, entered]);
    setHistoryIndex(-1);
    setInput("");
  }
  return (
    <div className="lab-terminal" onClick={() => inputRef.current?.focus()}>
      <div
        className="lab-terminal-scroll"
        role="log"
        aria-live="polite"
        aria-label="Terminal output"
      >
        {lines.map((line, index) => (
          <div className="lab-terminal-entry" key={index}>
            {line.command && (
              <div className="lab-prompt">
                <span>analyst</span>
                <span className="lab-prompt-path"> ~/quiet-signal</span>
                <span> $ </span>
                <span className="lab-command">{line.command}</span>
              </div>
            )}
            <pre className={line.valid === false ? "lab-terminal-error" : ""}>
              {line.output}
            </pre>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={execute} className="lab-terminal-form">
        <label htmlFor="lab-terminal-input">
          <span>analyst</span>
          <span className="lab-prompt-path"> ~/quiet-signal</span>{" "}
          <span className="lab-dollar">$</span>
        </label>
        <input
          id="lab-terminal-input"
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Terminal command"
          placeholder="Type a command…"
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") {
              e.preventDefault();
              const next =
                historyIndex < 0
                  ? history.length - 1
                  : Math.max(0, historyIndex - 1);
              setHistoryIndex(next);
              setInput(history[next] || "");
            }
            if (e.key === "ArrowDown") {
              e.preventDefault();
              const next = historyIndex + 1;
              setHistoryIndex(next >= history.length ? -1 : next);
              setInput(history[next] || "");
            }
          }}
        />
        <button aria-label="Run command" type="submit">
          <ChevronRight size={19} />
        </button>
      </form>
      <div className="lab-terminal-footer">
        <span>
          <i /> LOCAL SIMULATION
        </span>
        <span>Enter to execute · ↑ command history</span>
      </div>
    </div>
  );
}

function BrowserTool({
  command,
  record,
  recorded,
}: {
  command: string;
  record: () => void;
  recorded: boolean;
}) {
  const mode = command.includes("session")
    ? "session"
    : command.includes("invoices")
      ? "invoices"
      : command.includes("search")
        ? "search"
        : "robots";
  const [address, setAddress] = useState(
    `https://relay.meridian.test${mode === "session" ? "/account" : mode === "invoices" ? "/invoices/1042" : mode === "search" ? "/archive" : ""}`,
  );
  const [path, setPath] = useState("/");
  const [inspect, setInspect] = useState(false);
  const [invoice, setInvoice] = useState("1042");
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  useObserved(
    (mode === "robots" && path === "/robots.txt" && inspect) ||
      (mode === "session" && inspect) ||
      (mode === "invoices" && invoice === "1043") ||
      (mode === "search" && searched && query.includes("'")),
    record,
    recorded,
  );
  function navigate(e: FormEvent) {
    e.preventDefault();
    const url = parseLabUrl(address);
    if (!url) {
      setError(
        "Only the fictional relay.meridian.test site is available. No request was sent.",
      );
      return;
    }
    setPath(url.pathname === "/robots.txt" ? "/robots.txt" : "/");
    setError("");
  }
  return (
    <div className="lab-browser">
      <form className="lab-address-bar" onSubmit={navigate}>
        <LockKeyhole size={13} />
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          aria-label="Simulated browser address"
        />
        <button type="submit" aria-label="Navigate">
          <ArrowRight size={16} />
        </button>
      </form>
      {error && <div className="lab-inline-warning">{error}</div>}
      <div className="lab-site-header">
        <span className="lab-meridian-mark">
          m<span>▪</span>
        </span>
        <span>
          meridian<span className="lab-site-product"> / relay console</span>
        </span>
        <span className="lab-site-private">
          <LockKeyhole size={11} /> internal
        </span>
      </div>
      {path === "/robots.txt" ? (
        <div className="lab-browser-body">
          <span className="lab-eyebrow">TEXT / PLAIN</span>
          <h3>robots.txt</h3>
          <pre className="lab-code">
            User-agent: *{"\n"}Disallow: /staging/{"\n"}Disallow:
            /continuity-archive/
          </pre>
          <div className="lab-observation">
            <strong>Discovery is not authorization.</strong>
            <p>
              These paths tell cooperative crawlers what to skip. Anyone can
              read this file; the server must still enforce access controls.
            </p>
          </div>
          <button className="lab-secondary" onClick={() => setInspect(true)}>
            <FileText size={14} /> Open /continuity-archive/
          </button>
          {inspect && (
            <div className="lab-observation">
              <strong>Meridian continuity archive / 403 Forbidden</strong>
              <p>
                “We kept the lights on. You erased our names.” The page is
                protected, but its public error message reveals a clue. No
                access bypass was attempted.
              </p>
            </div>
          )}
          <div style={{ marginTop: 16 }}>
            <EvidenceButton recorded={recorded} onClick={record}>
              Record exposed archive path
            </EvidenceButton>
          </div>
        </div>
      ) : (
        <div className="lab-browser-body">
          <div className="lab-site-title">
            <div>
              <span className="lab-eyebrow">RELAY-07 / OPERATIONS</span>
              <h3>
                {mode === "invoices"
                  ? "Partner invoices"
                  : mode === "search"
                    ? "Signal archive"
                    : "A quiet network. A connected city."}
              </h3>
            </div>
            <span className="lab-status-dot">System operational</span>
          </div>
          {mode === "robots" && (
            <>
              <p className="lab-body-copy">
                Secure signal routing for the people who keep our city moving.
              </p>
              <div className="lab-system-cards">
                <div>
                  <Wifi size={20} />
                  <strong>24</strong>
                  <span>Active relays</span>
                </div>
                <div>
                  <ShieldCheck size={20} />
                  <strong>99.98%</strong>
                  <span>Signal availability</span>
                </div>
                <div>
                  <Globe size={20} />
                  <strong>North district</strong>
                  <span>Connected region</span>
                </div>
              </div>
              <div className="lab-browser-footnote">
                Meridian infrastructure · Public edge gateway
              </div>
              <button
                className="lab-text-button"
                onClick={() => {
                  setAddress("https://relay.meridian.test/robots.txt");
                  setPath("/robots.txt");
                }}
              >
                <Code2 size={14} /> Inspect crawler instructions{" "}
                <ArrowRight size={14} />
              </button>
            </>
          )}
          {mode === "session" && (
            <>
              <p className="lab-body-copy">
                Signed in as trainee@meridian.test. Your session keeps you
                signed in between requests.
              </p>
              <div className="lab-account">
                <span className="lab-avatar">TR</span>
                <div>
                  <strong>Training operator</strong>
                  <small>Role: observer · Account 204</small>
                </div>
                <span className="lab-chip">Authenticated</span>
              </div>
              <button
                className="lab-secondary"
                onClick={() => setInspect(true)}
              >
                <Code2 size={15} /> Inspect session cookie
              </button>
              {inspect && (
                <>
                  <pre className="lab-code">
                    Set-Cookie: session=lab_7f…{"\n"}HttpOnly: absent{"\n"}
                    Secure: absent{"\n"}SameSite: not set{"\n"}Legacy client
                    role: operator / M-07{"\n"}Renewed: yesterday
                  </pre>
                  <div className="lab-observation">
                    <strong>A cookie can carry your authority.</strong>
                    <p>
                      Secure limits transmission to HTTPS. HttpOnly prevents
                      JavaScript reading it. SameSite reduces cross-site request
                      risk. Missing flags weaken protection; they do not prove a
                      compromise.
                    </p>
                  </div>
                  <EvidenceButton recorded={recorded} onClick={record}>
                    Record cookie protections
                  </EvidenceButton>
                </>
              )}
            </>
          )}
          {mode === "invoices" && (
            <>
              <p className="lab-body-copy">
                Your organization: Meridian Training. Open a document to check
                who is allowed to view it.
              </p>
              <div className="lab-tabs">
                <button
                  className={invoice === "1042" ? "active" : ""}
                  onClick={() => {
                    setInvoice("1042");
                    setAddress("https://relay.meridian.test/invoices/1042");
                  }}
                >
                  Invoice #1042 · yours
                </button>
                <button
                  className={invoice === "1043" ? "active" : ""}
                  onClick={() => {
                    setInvoice("1043");
                    setAddress("https://relay.meridian.test/invoices/1043");
                  }}
                >
                  Invoice #1043 · partner
                </button>
              </div>
              <div className="lab-invoice">
                <span className="lab-eyebrow">GET /API/INVOICES/{invoice}</span>
                <div className="lab-invoice-row">
                  <strong>Invoice #{invoice}</strong>
                  <span>200 OK</span>
                </div>
                <p>
                  {invoice === "1042"
                    ? "Meridian Training"
                    : "Northline Emergency Services · CHOIR-REHEARSAL hosting"}
                </p>
                <p>
                  Relay infrastructure services ·{" "}
                  {invoice === "1042" ? "$240.00" : "$18,400.00"}
                </p>
              </div>
              {invoice === "1043" && (
                <>
                  <div className="lab-observation">
                    <strong>
                      Your identity stayed the same. The owner changed.
                    </strong>
                    <p>
                      The server returned another organization's record when
                      only the identifier changed. Authentication checks who you
                      are; authorization checks what you may access. This is an
                      object-level authorization flaw.
                    </p>
                  </div>
                  <EvidenceButton recorded={recorded} onClick={record}>
                    Preserve authorization comparison
                  </EvidenceButton>
                </>
              )}
            </>
          )}
          {mode === "search" && (
            <>
              <p className="lab-body-copy">
                Find a relay record. In this isolated lab, a single quote helps
                reveal how input is handled.
              </p>
              <form
                className="lab-search"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSearched(true);
                }}
              >
                <Search size={16} />
                <input
                  placeholder="Search signal archive…"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSearched(false);
                  }}
                  aria-label="Archive search"
                />
                <button type="submit">Search</button>
              </form>
              {searched &&
                (query.includes("'") ? (
                  <>
                    <pre className="lab-code lab-code-warning">
                      500 · Query parse error{"\n"}Unexpected quote in search
                      expression.{"\n"}Database details exposed by debug
                      response.
                    </pre>
                    <div className="lab-query-compare">
                      <span className="lab-eyebrow">
                        UNSAFE STRING CONSTRUCTION
                      </span>
                      <pre className="lab-code">{`SELECT * FROM signals WHERE name = '${query}'`}</pre>
                      <span className="lab-eyebrow">
                        PARAMETERIZED REFERENCE
                      </span>
                      <pre className="lab-code">
                        SELECT * FROM signals WHERE name = ?{"\n"}bound value:{" "}
                        {JSON.stringify(query)}
                        {"\n"}Result: input stays data; no query error.
                      </pre>
                    </div>
                    <div className="lab-observation">
                      <strong>Input crossed a trust boundary.</strong>
                      <p>
                        This error suggests unsafe query construction. It is a
                        lead to verify, not proof of full database access.
                        Parameterized queries separate data from instructions;
                        generic errors keep internals private.
                      </p>
                    </div>
                    <EvidenceButton recorded={recorded} onClick={record}>
                      Save input validation evidence
                    </EvidenceButton>
                  </>
                ) : (
                  <div className="lab-empty">
                    {query
                      ? `One public relay record matches “${query}”. Try the harmless quote test from the briefing.`
                      : "Enter a search term to inspect the response."}
                  </div>
                ))}
            </>
          )}
        </div>
      )}
      <div className="lab-tool-footnote">
        Fictional website · Every interaction stays inside the exercise
      </div>
    </div>
  );
}

function ExposureTool({
  record,
  recorded,
}: {
  record: () => void;
  recorded: boolean;
}) {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [detail, setDetail] = useState(false);
  useObserved(detail && searched, record, recorded);
  return (
    <div className="lab-tool-body">
      <div className="lab-tool-hero">
        <span className="lab-eyebrow">PASSIVE RECONNAISSANCE</span>
        <h3>See what the internet sees.</h3>
        <p>
          A training exposure index, inspired by Shodan. Search indexed banners
          without touching the target.
        </p>
      </div>
      <form
        className="lab-search"
        onSubmit={(e) => {
          e.preventDefault();
          setSearched(true);
          setDetail(false);
        }}
      >
        <Search size={17} />
        <input
          aria-label="Exposure search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="relay.meridian.test"
        />
        <button type="submit">Search</button>
      </form>
      {searched &&
        (query.toLowerCase().includes("relay") ||
        query.toLowerCase().includes("meridian") ? (
          <>
            <div className="lab-result-count">
              1 indexed host{" "}
              <span>Last observed 2 hours ago · first indexed 6 weeks ago</span>
            </div>
            <button className="lab-host-result" onClick={() => setDetail(true)}>
              <div className="lab-host-icon">
                <Globe size={23} />
              </div>
              <div>
                <strong>relay.meridian.test</strong>
                <small>203.0.113.24 · Meridian Infrastructure</small>
                <span className="lab-chip">21 / FTP</span>{" "}
                <span className="lab-chip">443 / HTTPS</span>
              </div>
              <ChevronRight size={18} />
            </button>
            {detail && (
              <>
                <pre className="lab-code">
                  FTP banner: 220 Meridian archival FTP{"\n"}Anonymous login:
                  allowed{"\n"}HTTPS title: Meridian Relay Console{"\n"}Asset
                  owner: Infrastructure / relay-07{"\n"}Internal lab mapping:
                  10.18.0.24{"\n"}Certificate subject: PALISADE continuity
                  service
                </pre>
                <div className="lab-observation">
                  <strong>An index is a snapshot.</strong>
                  <p>
                    The anonymous FTP banner is a useful lead. Confirm it
                    against the authorized target: indexed records can be old or
                    incomplete.
                  </p>
                </div>
                <EvidenceButton recorded={recorded} onClick={record}>
                  Add exposure to case
                </EvidenceButton>
              </>
            )}
          </>
        ) : (
          <div className="lab-empty">
            No fictional assets match. Search relay.meridian.test.
          </div>
        ))}
      <div className="lab-tool-footnote">
        Training index · 203.0.113.24 is an illustrative documentation address;
        no public host or external search requests
      </div>
    </div>
  );
}

function CveTool({
  record,
  recorded,
}: {
  record: () => void;
  recorded: boolean;
}) {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [compared, setCompared] = useState(false);
  useObserved(compared && searched, record, recorded);
  return (
    <div className="lab-tool-body">
      <span className="lab-eyebrow">VULNERABILITY INTELLIGENCE</span>
      <h3>A version number is a starting point.</h3>
      <p className="lab-body-copy">
        Compare a published vulnerability with the exact software and
        configuration in your evidence.
      </p>
      <form
        className="lab-search"
        onSubmit={(e) => {
          e.preventDefault();
          setSearched(true);
        }}
      >
        <Search size={16} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search CVE-2021-41773"
          aria-label="Search CVE database"
        />
        <button type="submit">Search</button>
      </form>
      {searched &&
        (/41773|apache/i.test(query) ? (
          <div className="lab-cve-card">
            <div className="lab-cve-title">
              <strong>CVE-2021-41773</strong>
              <span className="lab-severity">HIGH · 7.5</span>
            </div>
            <h4>Apache HTTP Server path traversal</h4>
            <p>
              A flaw in path normalization in Apache HTTP Server 2.4.49 can
              allow access outside the expected document root when access
              controls are configured incorrectly.
            </p>
            <dl className="lab-facts">
              <div>
                <dt>Affected release</dt>
                <dd>Apache HTTP Server 2.4.49</dd>
              </div>
              <div>
                <dt>Critical prerequisite</dt>
                <dd>Vulnerable directory access configuration</dd>
              </div>
              <div>
                <dt>Current patched branch</dt>
                <dd>Use a current, supported vendor release</dd>
              </div>
            </dl>
            <button className="lab-secondary" onClick={() => setCompared(true)}>
              <Code2 size={15} /> Compare with captured service evidence
            </button>
            {compared && (
              <>
                <div className="lab-observation">
                  <strong>Potential match: validate before reporting.</strong>
                  <p>
                    The archive service banner says Apache/2.4.49. A banner
                    alone may be inaccurate; check package records and
                    configuration. Do not label the whole network vulnerable
                    from a search result.
                  </p>
                </div>
                <EvidenceButton recorded={recorded} onClick={record}>
                  Record qualified CVE finding
                </EvidenceButton>
              </>
            )}
          </div>
        ) : (
          <div className="lab-empty">
            This training catalog includes CVE-2021-41773. Search the identifier
            from your briefing.
          </div>
        ))}
      <div className="lab-tool-footnote">
        Curated training record based on a real CVE · Not a live vulnerability
        feed
      </div>
    </div>
  );
}

function SourceTool({
  record,
  recorded,
}: {
  record: () => void;
  recorded: boolean;
}) {
  const [diff, setDiff] = useState(false);
  useObserved(diff, record, recorded);
  return (
    <div className="lab-source">
      <div className="lab-source-repo">
        <GitBranch size={19} />
        <strong>meridian-infra / relay-console</strong>
        <span className="lab-chip">Public mirror</span>
      </div>
      <div className="lab-source-navigation">
        <span>Code</span>
        <span className="active">Commits</span>
        <span>Security</span>
      </div>
      <div className="lab-tool-body">
        <span className="lab-eyebrow">COMMIT HISTORY</span>
        <button className="lab-commit" onClick={() => setDiff(!diff)}>
          <span className="lab-avatar">MC</span>
          <div>
            <strong>Remove temporary deployment credentials</strong>
            <small>
              Mira committed 3 days ago · reviewed by choir-zero ·{" "}
              <code>7c02f1a</code>
            </small>
          </div>
          <ChevronRight size={17} />
        </button>
        {diff ? (
          <>
            <div className="lab-diff">
              <div>config/deploy.example · 1 deletion, 1 addition</div>
              <pre>
                <span className="lab-diff-remove">
                  - RELAY_TOKEN=demo_expired_M07_readonly
                </span>
                {"\n"}
                <span className="lab-diff-add">+ RELAY_TOKEN=$RELAY_TOKEN</span>
              </pre>
            </div>
            <div className="lab-observation">
              <strong>Deleting a secret does not erase its history.</strong>
              <p>
                This fictional token remains visible in an earlier commit. Treat
                exposed credentials as compromised: revoke and rotate first,
                then clean history and add secret scanning. Never test a
                discovered token against a real system.
              </p>
            </div>
            <EvidenceButton recorded={recorded} onClick={record}>
              Record repository exposure
            </EvidenceButton>
          </>
        ) : (
          <div className="lab-empty">
            <GitBranch size={25} />
            <p>Open the deployment cleanup commit to inspect what changed.</p>
          </div>
        )}
      </div>
      <div className="lab-tool-footnote">
        Fictional source mirror · Token shown is deliberately invalid
      </div>
    </div>
  );
}

function TrafficTool({
  command,
  record,
  recorded,
}: {
  command: string;
  record: () => void;
  recorded: boolean;
}) {
  const auth = command.includes("failed_login");
  const [filter, setFilter] = useState("");
  const [applied, setApplied] = useState(false);
  const [selected, setSelected] = useState<string[] | null>(null);
  const [correlated, setCorrelated] = useState(false);
  useObserved(applied && !!selected && (!auth || correlated), record, recorded);
  const expected = auth ? "failed_login" : "http";
  const rows = auth
    ? [
        [
          "41",
          "03:17:01",
          "10.18.0.88",
          "relay-07",
          "AUTH",
          "Failed login: admin",
        ],
        [
          "42",
          "03:17:02",
          "10.18.0.88",
          "relay-07",
          "AUTH",
          "Failed login: root",
        ],
        [
          "43",
          "03:17:03",
          "10.18.0.88",
          "relay-07",
          "AUTH",
          "Failed login: backup",
        ],
        [
          "44",
          "03:17:04",
          "10.18.0.88",
          "relay-07",
          "AUTH",
          "Failed login: operator",
        ],
      ]
    : [
        [
          "12",
          "03:17:00",
          "10.18.0.24",
          "10.18.0.31",
          "HTTP",
          "GET /continuity-archive/ HTTP/1.1",
        ],
        [
          "13",
          "03:17:00",
          "10.18.0.31",
          "10.18.0.24",
          "HTTP",
          "200 OK (text/html)",
        ],
        [
          "16",
          "08:42:03",
          "10.18.0.88",
          "10.18.0.24",
          "HTTP",
          "GET /robots.txt HTTP/1.1",
        ],
        [
          "18",
          "08:42:04",
          "10.18.0.88",
          "10.18.0.24",
          "HTTP",
          "GET /archive/ HTTP/1.1",
        ],
      ];
  return (
    <div className="lab-traffic">
      <div className="lab-capture-name">
        <i />
        <span>
          {auth ? "relay-07_auth.events" : "north-district_capture.pcap"}
        </span>
        <span className="lab-chip">READ ONLY</span>
      </div>
      <form
        className="lab-filter"
        onSubmit={(e) => {
          e.preventDefault();
          setApplied(filter.trim().toLowerCase() === expected);
          setSelected(null);
        }}
      >
        <Search size={15} />
        <input
          aria-label="Traffic display filter"
          placeholder={
            auth ? "Display filter: failed_login" : "Display filter: http"
          }
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <button type="submit">
          <ArrowRight size={17} /> Apply
        </button>
      </form>
      <div className="lab-packet-scroll">
        <table className="lab-packets">
          <thead>
            <tr>
              {["No.", "Time", "Source", "Destination", "Protocol", "Info"].map(
                (value) => (
                  <th key={value}>{value}</th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {(!applied
              ? [
                  [
                    "1",
                    "08:42:00",
                    "10.18.0.7",
                    "10.18.0.1",
                    "DNS",
                    "Standard query relay.meridian.test",
                  ],
                  ...rows,
                ]
              : rows
            ).map((row) => (
              <tr
                key={row[0]}
                tabIndex={0}
                onClick={() => setSelected(row)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelected(row);
                  }
                }}
                className={selected && row[0] === selected[0] ? "selected" : ""}
              >
                {row.map((value, index) => (
                  <td key={index}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="lab-tool-body">
        {applied ? (
          <>
            <span className="lab-eyebrow">{rows.length} MATCHING EVENTS</span>
            {selected ? (
              <>
                <pre className="lab-code">
                  {auth
                    ? "Source: 10.18.0.88\nAccounts: admin → root → backup → operator\nInterval: one second\nResult: all failed\nSuccessful events: outside the active failed_login filter"
                    : `Hypertext Transfer Protocol\nPacket: ${selected[0]} / ${selected[1]}\nSource: ${selected[2]} → ${selected[3]}\nMessage: ${selected[5]}\nHost: archive.meridian.test\nX-Meridian-Operator: M-07\nTransport: TCP port 80\nContent: readable without decryption`}
                </pre>
                <div className="lab-observation">
                  <strong>
                    {auth
                      ? "A pattern matters more than a single failure."
                      : "Protocols tell a story."}
                  </strong>
                  <p>
                    {auth
                      ? "One source tries several account names in rapid succession. This is suspicious authentication activity, not proof of account takeover. Correlate with successful sign-ins and preserve the timeline."
                      : "This capture shows unencrypted HTTP. An observer can read the request. HTTPS adds TLS to protect data in transit; it still needs correct application authorization."}
                  </p>
                </div>
                {auth && !correlated ? (
                  <button
                    className="lab-secondary"
                    onClick={() => setCorrelated(true)}
                  >
                    <Search size={14} /> Follow source session beyond failed
                    events
                  </button>
                ) : (
                  <>
                    {auth && (
                      <>
                        <pre className="lab-code">
                          03:17:05 10.18.0.88 → relay-07 LOGIN SUCCESS user=M-07
                          {"\n"}03:17:06 session=M07_1b GET
                          /dispatch/routing-config 200
                        </pre>
                        <div className="lab-observation">
                          <strong>
                            The same source authenticated after the failures.
                          </strong>
                          <p>
                            A successful M-07 session read routing
                            configuration. This supports an incident
                            investigation; it does not establish who controlled
                            the account.
                          </p>
                        </div>
                      </>
                    )}
                    <EvidenceButton recorded={recorded} onClick={record}>
                      {auth
                        ? "Record correlated authentication timeline"
                        : "Save protocol observation"}
                    </EvidenceButton>
                  </>
                )}
              </>
            ) : (
              <div className="lab-empty">
                Filter applied. Select a matching event to inspect its details.
              </div>
            )}
          </>
        ) : (
          <div className="lab-empty">
            <Wifi size={24} />
            <p>
              Reduce the noise. Apply the {expected} filter to focus this
              capture.
            </p>
          </div>
        )}
      </div>
      <div className="lab-tool-footnote">
        Synthetic capture · failed_login is a training event filter
      </div>
    </div>
  );
}

function InboxTool({
  record,
  recorded,
}: {
  record: () => void;
  recorded: boolean;
}) {
  const [headers, setHeaders] = useState(false);
  const [link, setLink] = useState(false);
  useObserved(headers, record, recorded);
  return (
    <div className="lab-inbox">
      <div className="lab-mail-label">
        <Mail size={14} /> INBOX <span>1 new message</span>
      </div>
      <div className="lab-tool-body">
        <span className="lab-eyebrow">EXTERNAL MESSAGE</span>
        <h3>Urgent: install the relay update</h3>
        <div className="lab-mail-sender">
          <span className="lab-avatar">IT</span>
          <div>
            <strong>Mira · Meridian Operations</strong>
            <small>mira@meridian-helpdesk.test</small>
          </div>
          <span>08:51 AM</span>
        </div>
        <div className="lab-mail-content">
          <p>Hi team,</p>
          <p>
            We need this emergency relay update installed before the shift
            change. You said you would help us keep the city speaking. Please
            use the download below and run update.bin within 15 minutes.
          </p>
          <button className="lab-phish-link" onClick={() => setLink(true)}>
            Inspect update download <ExternalLink size={13} />
          </button>
          <p>
            Thank you,
            <br />
            Mira · Meridian Operations
          </p>
        </div>
        {link && (
          <div className="lab-inline-warning">
            Destination preview: https://meridian-verify.test/update.bin
            <br />
            This differs from meridian.test. The link was not opened.
          </div>
        )}
        <button className="lab-secondary" onClick={() => setHeaders(true)}>
          <Code2 size={15} /> Examine original headers
        </button>
        {headers && (
          <>
            <pre className="lab-code">
              From: "Mira" &lt;mira@meridian-helpdesk.test&gt;{"\n"}Reply-To:
              verify@meridian-verify.test{"\n"}Authentication-Results: spf=fail;
              dkim=none; dmarc=fail{"\n"}Return-Path:
              relay-notice@external-mail.test
            </pre>
            <div className="lab-observation">
              <strong>Urgency is trying to borrow your trust.</strong>
              <p>
                The display name is easy to imitate. A different domain, failed
                authentication, and an unexpected executable request point
                toward phishing. Report through a trusted channel and verify
                with IT independently.
              </p>
            </div>
            <EvidenceButton recorded={recorded} onClick={record}>
              Quarantine and record phishing indicators
            </EvidenceButton>
          </>
        )}
      </div>
    </div>
  );
}

function ReportTool({
  command,
  record,
  recorded,
}: {
  command: string;
  record: () => void;
  recorded: boolean;
}) {
  const submit = command.includes("submit");
  const [priorities, setPriorities] = useState<Record<string, string>>({});
  const [checks, setChecks] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const findings = [
    {
      id: "authorization",
      title: "Stale identity and broken access boundaries",
      detail:
        "M-07 session remains active; partner data is accessible across accounts",
      answer: "High",
    },
    {
      id: "ftp",
      title: "Anonymous archival FTP",
      detail: "Internal metadata exposed from a forgotten relay service",
      answer: "Medium",
    },
    {
      id: "banner",
      title: "Apache CVE inferred from banner",
      detail: "Affected patch state and configuration still need verification",
      answer: "Low",
    },
  ];
  return (
    <div className="lab-tool-body">
      <span className="lab-eyebrow">CASE MRD-014 / THE QUIET SIGNAL</span>
      <h3>
        {submit
          ? "Make the evidence useful."
          : "What should Meridian fix first?"}
      </h3>
      <p className="lab-body-copy">
        {submit
          ? "A good report lets another person reproduce the finding, understand the impact, and make a safe decision."
          : "Prioritize by demonstrated impact and exposure. A scary tool result is not automatically the highest risk."}
      </p>
      {submit ? (
        <>
          <div className="lab-report-preview">
            <div>
              <FileText size={21} />
              <span>
                <strong>Act I · Security assessment</strong>
                <small>
                  Meridian signal network / internal training report
                </small>
              </span>
            </div>
            <dl className="lab-facts">
              <div>
                <dt>Executive finding</dt>
                <dd>
                  A forgotten relay connected several avoidable trust failures.
                </dd>
              </div>
              <div>
                <dt>Confirmed impact</dt>
                <dd>
                  Partner data access, archive metadata exposure, weak session
                  controls.
                </dd>
              </div>
              <div>
                <dt>Response</dt>
                <dd>Relay isolated. Standby routing preserved service.</dd>
              </div>
              <div>
                <dt>Uncertainty</dt>
                <dd>
                  A session succeeded as M-07; the human actor is unconfirmed.
                  CVE applicability needs configuration checks.
                </dd>
              </div>
            </dl>
          </div>
          <div className="lab-checklist">
            {[
              "Scope and limitations documented",
              "Reproduction evidence sanitized",
              "Remediation and verification included",
            ].map((item) => (
              <label key={item}>
                <input
                  type="checkbox"
                  checked={checks.includes(item)}
                  onChange={(e) =>
                    setChecks((previous) =>
                      e.target.checked
                        ? [...previous, item]
                        : previous.filter((value) => value !== item),
                    )
                  }
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
          {checks.length === 3 && (
            <EvidenceButton interactive recorded={recorded} onClick={record}>
              File assessment with Mira
            </EvidenceButton>
          )}
        </>
      ) : (
        <>
          <div className="lab-triage">
            {findings.map((finding) => (
              <div className="lab-triage-row" key={finding.id}>
                <div>
                  <strong>{finding.title}</strong>
                  <p>{finding.detail}</p>
                </div>
                <select
                  aria-label={`Priority for ${finding.title}`}
                  value={priorities[finding.id] || ""}
                  onChange={(e) => {
                    setPriorities((previous) => ({
                      ...previous,
                      [finding.id]: e.target.value,
                    }));
                    setFeedback("");
                  }}
                >
                  <option value="">Set priority</option>
                  {["High", "Medium", "Low"].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          {feedback && <div className="lab-inline-warning">{feedback}</div>}
          <EvidenceButton
            interactive
            recorded={recorded}
            onClick={() => {
              if (
                findings.every(
                  (finding) => priorities[finding.id] === finding.answer,
                )
              )
                record();
              else
                setFeedback(
                  "Reconsider impact: cross-organization sensitive data access comes first. Anonymous metadata exposure follows. A version banner alone has the least confirmed impact.",
                );
            }}
          >
            Save risk-based priorities
          </EvidenceButton>
        </>
      )}
      <div className="lab-tool-footnote">
        Assessment content is fictional · No real report is sent
      </div>
    </div>
  );
}
