export type SimulationResult = { output: string; valid: boolean };

export const normalizeCommand = (value: string) =>
  value.trim().replace(/\s+/g, " ").toLowerCase();

/** Match a meaningful observation, including ordinary ways to reach the same evidence. */
export function isExpectedObservation(
  entered: string,
  expected: string,
): boolean {
  const key = normalizeCommand(entered);
  const goal = normalizeCommand(expected);
  if (key === goal) return true;
  if (goal === "cat scope.txt") return key === "cat ./scope.txt";
  if (goal === "ls -la")
    return ["ls -al", "ls -a", "ls -l -a", "ls -a -l"].includes(key);
  if (goal === "dig relay.meridian.test")
    return /^(dig|nslookup) (relay\.meridian\.test\.?|10\.18\.0\.24)$/.test(
      key,
    );
  if (goal === "nmap -sv relay.meridian.test") return key.startsWith("nmap ");
  if (goal === "ftp relay.meridian.test")
    return /^ftp (relay\.meridian\.test\.?|10\.18\.0\.24)$/.test(key);
  if (goal === "sha256sum update.bin") return key === "sha256sum ./update.bin";
  return false;
}

const scope = `MERIDIAN • RULES OF ENGAGEMENT
Case: THE QUIET SIGNAL / Act I
Authorized target: relay.meridian.test (isolated training host)
Exercise systems are fictional and isolated.
Permitted: observation, service enumeration, approved lab validation.
Out of scope: real services, destructive actions, credential reuse.
Record evidence. Verify impact. Report with care.
Approved incident action: isolate relay-07 while keeping dispatch online.
Handwritten note: "If you hear singing, tell Mira."`;

const outputs: Record<string, string> = {
  help: `Available field tools
  pwd                         Show your current directory
  whoami                      Identify the current operator
  ls                          List case files
  cat scope.txt               Read your authorization
  cat briefing.txt            Read the mission briefing
  clear                       Clear the screen

Your briefing introduces investigation tools as the case progresses.
All commands run inside the story simulator. No network traffic leaves this terminal.`,
  pwd: "/home/analyst/cases/quiet-signal",
  whoami: "analyst",
  id: "uid=1000(analyst) gid=1000(analyst) groups=1000(analyst),1001(case-readers)",
  ls: "scope.txt  briefing.txt  manifest.txt  update.bin  evidence/  reports/",
  "ls -la":
    "drwxr-xr-x analyst analyst  evidence/\ndrwxr-xr-x analyst analyst  reports/\n-rw-r--r-- analyst analyst  scope.txt\n-rw-r--r-- analyst analyst  briefing.txt\n-rw-r--r-- analyst analyst  manifest.txt\n-rw-r----- dispatch analyst Oct 16 03:17 .choir-note\n-rw------- analyst analyst  update.bin  [quarantined; do not execute]",
  "cat scope.txt": scope,
  "cat .choir-note": "03:17\nM-07\n",
  "cat briefing.txt":
    "MIRA / 08:41\nA forgotten relay has started answering requests.\nFind what is visible, understand why it matters, and preserve your evidence.\nOur adversary calls itself The Choir. Stay inside the signed scope.",
  "cat manifest.txt":
    "RELAY EXPORT / staging-archive\nOwner: Infrastructure / Meridian\nBackup: /continuity-archive/palisade-backup.zip\nService account: relay-reader\nNote: anonymous access was meant to be disabled before launch.\nProject: PALISADE\nContinuity engineers: A. Rana, J. Park, S. Bell, E. Vale, N. Okoro, T. Chen, Mira (M-07)\nEvidence ID: MRD-014 • no secrets downloaded",
  "cat robots.txt":
    "User-agent: *\nDisallow: /staging/\nDisallow: /continuity-archive/\n\n# A hint about paths, never an access-control boundary.",
  "dig relay.meridian.test":
    "; <<>> DiG 9.18 <<>> relay.meridian.test\n;; status: NOERROR\n;; ANSWER SECTION:\nrelay.meridian.test.  300  IN  A  10.18.0.24\n\n;; Query time: 12 msec\n;; SERVER: 10.18.0.1#53 (lab DNS)",
  "nslookup relay.meridian.test":
    "Server: 10.18.0.1\nName: relay.meridian.test\nAddress: 10.18.0.24",
  "nmap -sv relay.meridian.test":
    "Starting Nmap 7.95 — authorized lab simulation\nNmap scan report for relay.meridian.test (10.18.0.24)\nHost is up (0.012s latency).\nNot shown: 996 closed tcp ports\nPORT     STATE SERVICE VERSION\n21/tcp   open  ftp     vsftpd 3.0.3\n22/tcp   open  ssh     OpenSSH 8.9p1\n80/tcp   open  http    Apache httpd 2.4.49\n443/tcp  open  https   nginx 1.24.0\n\nService identification is a lead, not proof of a vulnerability.\nNmap done: 1 IP address (1 host up) scanned in 2.41 seconds",
  "nmap relay.meridian.test":
    "Nmap scan report for relay.meridian.test (10.18.0.24)\nPORT     STATE SERVICE\n21/tcp   open  ftp\n22/tcp   open  ssh\n80/tcp   open  http\n443/tcp  open  https\n\nTry -sV to identify service versions.",
  "curl -i https://relay.meridian.test":
    "HTTP/2 200\nserver: nginx/1.24.0\ncontent-type: text/html\nstrict-transport-security: max-age=31536000\nx-powered-by: Relay Console\nx-lab-scope: authorized\n\nMeridian Relay • Operational",
  "curl https://relay.meridian.test/robots.txt":
    "User-agent: *\nDisallow: /staging/\nDisallow: /continuity-archive/",
  "ftp relay.meridian.test":
    "Connected to relay.meridian.test (lab).\n220 Meridian continuity archive. Maintainer: M-07\nName: anonymous\n331 Guest login accepted for training.\n230 Login successful.\nftp> ls\n-r--r--r--  1 archive archive  248 manifest.txt\n\nRead-only lab session. Anonymous access exposes internal metadata.\nEvidence copied to your local case folder: manifest.txt",
  "ssh relay.meridian.test":
    "OpenSSH_8.9p1\nAuthentication required. No credentials provided.\nStop here: guessing passwords is not part of this exercise.",
  "ip addr":
    "2: eth0: <BROADCAST,MULTICAST,UP>\n    inet 10.18.0.7/24 scope global eth0\n    lab interface — no external network access",
  "ip a": "2: eth0: <UP>\n    inet 10.18.0.7/24 scope global eth0",
  "ping relay.meridian.test":
    "PING relay.meridian.test (10.18.0.24)\n64 bytes from 10.18.0.24: icmp_seq=1 ttl=64 time=12.0 ms\n64 bytes from 10.18.0.24: icmp_seq=2 ttl=64 time=11.8 ms\n--- 2 packets transmitted, 2 received, 0% packet loss ---",
  "cat access.log":
    "08:42:01  10.18.0.24  GET /                   200\n08:42:03  10.18.0.88  GET /robots.txt         200\n08:42:04  10.18.0.88  GET /staging/           200\n08:42:05  10.18.0.88  GET /.env               403\n08:42:06  10.18.0.88  GET /admin              401\n\nA fast sequence of sensitive paths suggests automated discovery.",
  "cat auth.log":
    "08:44:10 sshd: Failed password for invalid user admin from 10.18.0.88\n08:44:11 sshd: Failed password for invalid user root from 10.18.0.88\n08:44:12 sshd: Failed password for invalid user backup from 10.18.0.88\n08:44:13 sshd: Connection closed [preauth]\n\nMultiple account names from one source: suspected password spraying.",
  "audit cloud":
    "MERIDIAN CLOUD POSTURE / relay-07\n[PASS] Public network access: restricted\n[FAIL] archive bucket: public-read enabled\n[FAIL] relay-reader policy: storage:* on all resources\n[PASS] audit logging: enabled\n\nPublic data exposure and excessive permissions need separate fixes.\nRecommended: private bucket access, least-privilege role, verify audit logs.",
  "isolate relay-07":
    "INCIDENT CONTROL / authorized lab action\nPreserving logs and memory snapshot… complete\nRestricting relay-07 ingress to incident-response subnet… complete\nRevoking relay-reader active session… complete\nMoving signal routing to healthy standby… complete\n\nrelay-07 is isolated. City signal routing remains operational.\nNext: investigate root cause, remediate, verify, then restore.",
  "cat incident.log":
    "INCIDENT MRD-014\n08:42 — rapid route enumeration observed\n08:44 — repeated failed sign-ins\n08:46 — source isolated in exercise network\n03:17 — M-07 authenticated after repeated failures; routing configuration read\nActor remains unconfirmed. Preserve logs before remediation.",
};

const labHost = "relay.meridian.test";
const labAddress = "10.18.0.24";

function isLabHost(value: string) {
  return (
    value.toLowerCase().replace(/\.$/, "") === labHost || value === labAddress
  );
}

/** Parse the simulated address, rejecting lookalikes, userinfo, and other protocols. */
export function parseLabUrl(value: string): URL | null {
  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    return ["http:", "https:"].includes(url.protocol) &&
      isLabHost(url.hostname) &&
      !url.username &&
      !url.password &&
      ["", "80", "443"].includes(url.port)
      ? url
      : null;
  } catch {
    return null;
  }
}

const scopeFailure: SimulationResult = {
  output:
    "SCOPE GUARD\nThat destination or command is outside the supported exercise. Use the fictional target in your mission briefing. No request was sent.",
  valid: false,
};

export function runCommand(
  command: string,
  target = labHost,
): SimulationResult {
  const key = normalizeCommand(command);
  if (!key) return { output: "", valid: false };
  if (!isLabHost(target)) return scopeFailure;
  if (/[;|&<>\n\r]/.test(command))
    return {
      output:
        "This field terminal runs one simulated command at a time. Shell operators and command substitution are unavailable. Nothing was executed.",
      valid: false,
    };
  if (key === "clear") return { output: "", valid: true };
  const tokens = command.trim().split(/\s+/);
  const program = tokens[0].toLowerCase();

  if (program === "cat" && tokens.length === 2 && tokens[1].startsWith("./")) {
    const fileCommand = `cat ${tokens[1].slice(2)}`;
    if (Object.hasOwn(outputs, fileCommand))
      return { output: outputs[fileCommand], valid: true };
  }
  if (
    program === "ls" &&
    tokens.length > 1 &&
    tokens.slice(1).every((flag) => ["-a", "-l", "-al", "-la"].includes(flag))
  ) {
    return {
      output: tokens.slice(1).some((flag) => flag.includes("a"))
        ? outputs["ls -la"]
        : outputs["ls -la"]
            .split("\n")
            .filter((line) => !line.includes(".choir-note"))
            .join("\n"),
      valid: true,
    };
  }

  if (program === "curl") {
    const operands = tokens.slice(1).filter((token) => !token.startsWith("-"));
    const supportedFlags = new Set(["-I", "-i", "-s", "-sI", "-si"]);
    if (
      operands.length !== 1 ||
      tokens
        .slice(1)
        .some((token) => token.startsWith("-") && !supportedFlags.has(token))
    )
      return scopeFailure;
    const url = parseLabUrl(operands[0]);
    if (!url) return scopeFailure;
    const headersOnly = tokens.includes("-I") || tokens.includes("-sI");
    if (url.pathname === "/robots.txt")
      return {
        output: headersOnly
          ? "HTTP/1.1 200 OK\ncontent-type: text/plain"
          : outputs["cat robots.txt"],
        valid: true,
      };
    if (url.pathname !== "/")
      return {
        output:
          "HTTP/2 403\nAccess to this training route requires authorization. No access bypass was attempted.",
        valid: true,
      };
    const response =
      url.protocol === "http:"
        ? outputs["curl -i https://relay.meridian.test"]
            .replace("HTTP/2 200", "HTTP/1.1 200 OK")
            .replace("strict-transport-security: max-age=31536000\n", "")
        : outputs["curl -i https://relay.meridian.test"];
    const includeHeaders = tokens.includes("-i") || tokens.includes("-si");
    return {
      output: headersOnly
        ? response.split("\n\n")[0]
        : includeHeaders
          ? response
          : "Meridian Relay • Operational",
      valid: true,
    };
  }
  if (Object.hasOwn(outputs, key)) return { output: outputs[key], valid: true };
  if (program === "nmap") {
    const allowedHost = tokens.at(-1)!;
    const flags = tokens.slice(1, -1).map((token) => token.toLowerCase());
    if (
      !isLabHost(allowedHost) ||
      flags.some((flag) => !["-sv", "-st", "-ss", "-pn"].includes(flag))
    )
      return scopeFailure;
    return {
      output:
        outputs[
          flags.includes("-sv")
            ? "nmap -sv relay.meridian.test"
            : "nmap relay.meridian.test"
        ],
      valid: true,
    };
  }
  if (program === "dig" || program === "nslookup") {
    if (tokens.length !== 2 || !isLabHost(tokens[1])) return scopeFailure;
    return { output: outputs[`${program} relay.meridian.test`], valid: true };
  }
  if (["ftp", "ssh", "ping"].includes(program)) {
    if (tokens.length !== 2 || !isLabHost(tokens[1])) return scopeFailure;
    return { output: outputs[`${program} relay.meridian.test`], valid: true };
  }
  if (program === "openssl") {
    if (
      tokens.length !== 5 ||
      tokens[1] !== "s_client" ||
      tokens[2] !== "-connect" ||
      !/^(relay\.meridian\.test|10\.18\.0\.24):443$/.test(tokens[3]) ||
      tokens[4] !== "-brief"
    )
      return scopeFailure;
    return {
      output:
        "CONNECTED (lab)\nCertificate chain: Meridian Training CA\nProtocol: TLSv1.3\nCipher: TLS_AES_256_GCM_SHA384\nVerify return code: 0 (ok)\n\nEncryption protects the connection; it does not prove the site is trustworthy.",
      valid: true,
    };
  }
  if (program === "grep") {
    const file = tokens.at(-1);
    if (tokens.length < 3 || !["access.log", "auth.log"].includes(file || ""))
      return {
        output: "grep: select an available case log (access.log or auth.log).",
        valid: false,
      };
    const pattern = tokens
      .slice(1, -1)
      .join(" ")
      .replace(/^['"]|['"]$/g, "");
    const source = outputs[`cat ${file}`];
    const matched = source.split("\n").filter((line) => line.includes(pattern));
    return { output: matched.join("\n") || "(no matching lines)", valid: true };
  }
  if (program === "sha256sum") {
    if (
      tokens.length !== 2 ||
      !["update.bin", "./update.bin"].includes(tokens[1])
    )
      return {
        output: `sha256sum: ${tokens.slice(1).join(" ") || "(missing file)"}: No such case file\nThe quarantined training artifact is update.bin.`,
        valid: false,
      };
    return {
      output: `4cb8a5f94d61f12b1f7cb63cc5a5cf2d5cb6a0d32ce20157f36887f098e8a701  ${tokens[1]}\nVendor reference: a82632f9d10aee4a8094c112129e1fce36657dde44671507ceeb608c84f0c6a9\nMISMATCH: this file differs from the signed release. Quarantine it; do not execute.`,
      valid: true,
    };
  }
  if (program === "cat")
    return {
      output: `cat: ${command.trim().slice(4)}: No such case file\nUse ls to see available files.`,
      valid: false,
    };
  return {
    output: `${tokens[0]}: command unavailable in this exercise.\nType help for your field toolkit. Nothing was executed outside the simulation.`,
    valid: false,
  };
}
