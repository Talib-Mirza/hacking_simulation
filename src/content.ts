export type Tool =
  | "terminal"
  | "browser"
  | "shodan"
  | "cve"
  | "github"
  | "wireshark"
  | "inbox"
  | "report";
export type Mission = {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  minutes: number;
  tool: Tool;
  command: string;
  intro: string;
  transmission: string;
  concepts: string[];
  lesson: string[];
  objective: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  evidence: string;
  reveal: string;
};
export const missions: Mission[] = [
  {
    id: 0,
    title: "A seat at the table",
    subtitle: "Every good investigation starts with permission.",
    category: "FOUNDATIONS",
    minutes: 12,
    tool: "terminal",
    command: "cat scope.txt",
    intro:
      "Monday. 08:42. Your visitor badge still says TEMPORARY. Meridian routes emergency communications for three million people. You were hired to help with IT. Then the lift stops on a floor that isn’t in your welcome pack. Mira, the security lead, is waiting: “We’ve spent years holding off a group called The Choir. Last night, they came back.”",
    transmission:
      "You don’t need to be a hacker to help us. You need to be curious, careful, and willing to ask why. First, read what we’re allowed to touch. — Mira",
    concepts: [
      "Authorization & scope",
      "CIA triad",
      "Rules of engagement",
      "Evidence handling",
    ],
    lesson: [
      "A penetration test is an authorized attempt to find weaknesses before someone else does. Authorization is specific: which systems, which techniques, and which dates. A reachable system is not automatically yours to test. Start with the written scope, and pause when you find something outside it.",
      "Security protects confidentiality (who can read information), integrity (whether it can be trusted), and availability (whether it is there when needed). For Meridian, an unavailable dispatch line is as serious as a leaked password. A threat is a possible source of harm; a vulnerability is a weakness; risk combines likelihood with impact.",
      "The terminal is a text interface. You type a command; a program returns a result. The command cat displays a file. Here, cat scope.txt opens your authorization. This training network is fully simulated: your commands never contact real hosts. Keep notes of observations, timing, and scope throughout the investigation.",
    ],
    objective:
      "Read the rules of engagement in scope.txt. Identify the one authorized target.",
    question:
      "A scan reveals a partner’s server outside the written scope. What comes next?",
    options: [
      "Test it quickly before the opportunity disappears.",
      "Record the observation and request explicit authorization.",
      "Assume the company’s permission covers its partners.",
    ],
    answer: 1,
    explanation:
      "Ownership, connectivity, and authorization are different things. Record what you found, but obtain written permission before testing a new asset.",
    evidence:
      "Signed scope: relay.meridian.test • passive and contained active testing authorized.",
    reveal:
      "At the bottom of the scope file, someone has written: “If you hear singing, tell Mira.”",
  },
  {
    id: 1,
    title: "The room behind the room",
    subtitle: "Learn to read a machine before you trust it.",
    category: "SYSTEMS",
    minutes: 15,
    tool: "terminal",
    command: "ls -la",
    intro:
      "Mira gives you an old workstation. Its last owner left six months ago. There is a fresh file in the home directory—and a hidden one that nobody mentioned.",
    transmission:
      "A computer tells you a lot before you ask it a difficult question. Start with what is already in front of you.",
    concepts: [
      "Linux filesystem",
      "Files & permissions",
      "Users & privilege",
      "Hidden files",
    ],
    lesson: [
      "Linux organizes files in a tree rooted at /. Your current working directory is where relative paths begin. pwd prints it; ls lists its contents; cd changes it. A path beginning with / is absolute. A leading dot makes a file hidden from a normal directory listing, not protected from access.",
      "Run ls -la to include hidden entries and details. The permissions rwxr-x--- describe what the owner, group, and everyone else may do: read, write, and execute. For a directory, execute permits traversal. Ownership and permission are separate from a filename’s appearance.",
      "Use the smallest privilege needed. An administrator account can change far more than an ordinary user; that amplifies both mistakes and compromise. Don’t execute unknown files just to learn what they do. Inspect their names, metadata, and readable content first. In a real investigation, preserve originals and work from copies.",
    ],
    objective:
      "List all files with their permissions. Look for the hidden Choir note.",
    question:
      "Does hiding a sensitive file with a leading dot protect its contents?",
    options: [
      "Yes. Normal users cannot access hidden files.",
      "Only if its name is difficult to guess.",
      "No. Permissions and access controls protect it.",
    ],
    answer: 2,
    explanation:
      "Hidden is a display convention. Authorization must be enforced through permissions and access controls.",
    evidence:
      "Hidden file: .choir-note • owner dispatch • modified after the previous analyst left.",
    reveal:
      "The note contains only a time: 03:17. And an internal employee number: M-07.",
  },
  {
    id: 2,
    title: "A name in the static",
    subtitle: "Follow a domain to the machine behind it.",
    category: "NETWORKS",
    minutes: 18,
    tool: "terminal",
    command: "dig relay.meridian.test",
    intro:
      "At 03:17 every morning, a forgotten relay asks the same question: where is archive.meridian.test? The name means nothing to the new operations team.",
    transmission:
      "Names are for people. Addresses are for machines. DNS is the translation—and sometimes the paper trail.",
    concepts: [
      "IP addressing",
      "DNS records",
      "TCP/IP & routing",
      "Private networks",
    ],
    lesson: [
      "An IP address identifies a network interface. Private ranges such as 10.0.0.0/8 are used inside networks and are not globally routed. A subnet groups addresses; routing moves packets between networks. NAT can map many private devices to a public address, so one public address need not mean one machine.",
      "DNS translates names into records. A records point to IPv4 addresses; AAAA to IPv6; CNAME aliases another name; MX identifies mail servers; TXT stores text used for things like verification and mail policy. dig queries DNS and shows the response, record type, and time to live (TTL). DNS results are observations, not proof of ownership.",
      "TCP establishes a connection and delivers ordered data. UDP sends datagrams without that guarantee. DNS commonly uses UDP 53, with TCP also supported. TLS adds authenticated encryption to supported application protocols. DNS tells you where to connect; it does not tell you whether the service at that address is safe.",
    ],
    objective: "Resolve relay.meridian.test with dig and record its address.",
    question: "What does a DNS A record provide?",
    options: [
      "An IPv4 address associated with a name.",
      "The list of every open port on a machine.",
      "Proof that a website is secure.",
    ],
    answer: 0,
    explanation:
      "A records map a DNS name to an IPv4 address. They do not describe exposed services or establish application security.",
    evidence:
      "DNS answer recorded for relay.meridian.test. The relay is inside the authorized training network.",
    reveal:
      "The DNS record was changed at 03:17. The change request bears the employee number M-07.",
  },
  {
    id: 3,
    title: "The door left open",
    subtitle: "Discover services. Don’t mistake a door for a break-in.",
    category: "RECONNAISSANCE",
    minutes: 20,
    tool: "terminal",
    command: "nmap -sV relay.meridian.test",
    intro:
      "The asset register calls Relay 07 “retired.” The network disagrees. Something on it is still answering.",
    transmission:
      "An open port tells you something is listening. The next question is what—and whether it should be.",
    concepts: [
      "Ports & services",
      "Nmap service detection",
      "TCP states",
      "Attack surface",
    ],
    lesson: [
      "A port is a numbered endpoint for a network service. TCP 443 often serves HTTPS; TCP 22 often serves SSH. Those are conventions, not guarantees. A service can listen on an unexpected port, and multiple applications can share infrastructure. An attack surface is the set of reachable interfaces and opportunities for misuse.",
      "Nmap -sV attempts to identify services and versions. Open means a service accepted the probe; closed means the host responded but no service accepted it; filtered means a firewall or network condition prevented a clear answer. A filtered port is not proof that a host is absent or secure.",
      "Active scanning sends traffic and can affect fragile services. Written scope, timing, and rate limits matter. A version banner is a clue, not a confirmed vulnerability: it can be inaccurate, customized, or patched without changing its visible version. Record exposure and investigate before claiming a finding.",
    ],
    objective:
      "Run service detection against the authorized relay. Identify its legacy file service.",
    question: "The scan reports an open FTP port. What have you established?",
    options: [
      "The machine is already compromised.",
      "An FTP service is reachable and needs investigation.",
      "Any published FTP exploit will work.",
    ],
    answer: 1,
    explanation:
      "Reachability is an observation. Whether it creates exploitable risk depends on configuration, access, data, and business context.",
    evidence:
      "Relay inventory: SSH, HTTP, HTTPS, and legacy FTP. Asset register contradicts the live host.",
    reveal:
      "Port 21 serves a banner: “Meridian continuity archive. Maintainer: M-07.”",
  },
  {
    id: 4,
    title: "Someone else’s map",
    subtitle: "See your perimeter the way the outside world does.",
    category: "OPEN-SOURCE INTELLIGENCE",
    minutes: 16,
    tool: "shodan",
    command: "search relay.meridian.test",
    intro:
      "Someone indexed the relay before your team knew it existed. Its public banner has been sitting in an exposure search engine for weeks.",
    transmission:
      "The Choir doesn’t have to knock on every door. Sometimes the internet already has a map.",
    concepts: [
      "Passive reconnaissance",
      "Shodan-style search",
      "Asset inventory",
      "Exposure vs vulnerability",
    ],
    lesson: [
      "Open-source intelligence gathers information from publicly available sources: public websites, certificate records, repositories, and indexed services. Passive reconnaissance uses existing observations rather than probing the target directly. An exposure engine such as Shodan indexes service banners and internet-facing assets. This tool is a fictional local equivalent.",
      "Search results may be stale, incomplete, or misattributed. Check the observation date, hostname, ownership, and service details. A hostname in a certificate or a shared IP alone does not establish that an organization owns every service there. Correlate multiple sources and stay within scope.",
      "An accurate asset inventory is a security control. Unknown assets miss patching, monitoring, and decommissioning. Compare external observations with internal records. Prioritize unexpected administrative interfaces and sensitive services over making a long list of everything that exists.",
    ],
    objective:
      "Search the exposure index for relay.meridian.test and inspect the matching host.",
    question:
      "An exposure search result is three months old. What should you do?",
    options: [
      "Report its banner as a confirmed current vulnerability.",
      "Ignore all historical results.",
      "Correlate it with current, authorized observations.",
    ],
    answer: 2,
    explanation:
      "Historical exposure can be useful evidence, but you must distinguish an old observation from the host’s current state.",
    evidence:
      "Exposure index: the retired relay was publicly observable before the first 03:17 event.",
    reveal:
      "A certificate subject mentions a project nobody remembers: PALISADE.",
  },
  {
    id: 5,
    title: "The page nobody linked",
    subtitle: "Read the conversation between a browser and a server.",
    category: "WEB FOUNDATIONS",
    minutes: 22,
    tool: "browser",
    command: "inspect robots.txt",
    intro:
      "The relay hosts a maintenance website. Its front page looks harmless. Its instructions to search engines are more revealing.",
    transmission:
      "A browser renders the answer. A tester learns to read the request as well.",
    concepts: [
      "HTTP requests & responses",
      "Status codes & headers",
      "URLs & methods",
      "robots.txt & disclosure",
    ],
    lesson: [
      "HTTP is a request–response protocol. A request includes a method, path, headers, and sometimes a body. GET normally retrieves a resource; POST usually submits data. A response includes a status, headers, and a body. 200 means success, 301/302 redirection, 401 missing or invalid authentication, 403 refusal, and 404 not found.",
      "HTTPS wraps HTTP in TLS, protecting traffic in transit and authenticating the server when certificate verification succeeds. It does not prevent broken authorization or unsafe application logic. Headers describe behavior: Content-Type identifies the representation; Set-Cookie creates a cookie; security headers can reduce specific browser risks.",
      "robots.txt asks cooperative crawlers not to index certain paths. It is public and does not restrict access. A sensitive path listed there still needs server-side authorization. Inspect the training site’s robots.txt, then follow the disclosed archive path to understand why information disclosure can help an attacker.",
    ],
    objective: "Open the relay website and inspect its robots.txt file.",
    question: "Why is a private archive listed in robots.txt still exposed?",
    options: [
      "robots.txt is advisory, not an access control.",
      "TLS automatically bypasses robots.txt.",
      "All hidden paths are vulnerable to SQL injection.",
    ],
    answer: 0,
    explanation:
      "Search-engine instructions do not decide who may read a resource. The server must enforce access control on every request.",
    evidence:
      "robots.txt discloses /continuity-archive/ on the maintenance website.",
    reveal:
      "The archive page says: “We kept the lights on. You erased our names.”",
  },
  {
    id: 6,
    title: "An anonymous invitation",
    subtitle: "A convenience setting becomes a data exposure.",
    category: "SERVICE SECURITY",
    minutes: 18,
    tool: "terminal",
    command: "ftp relay.meridian.test",
    intro:
      "The archive website is locked. The old file service beside it is more welcoming. It still accepts anonymous visitors.",
    transmission:
      "Old systems often survive because something important depends on them. Find that dependency before you pull a plug.",
    concepts: [
      "FTP & anonymous access",
      "Cleartext protocols",
      "Least privilege",
      "Secure alternatives",
    ],
    lesson: [
      "FTP is an older file-transfer protocol. Traditional FTP sends credentials and content without encryption and uses separate control and data channels. SFTP is a different protocol carried over SSH. FTPS adds TLS to FTP. Similar names do not make them interchangeable.",
      "Anonymous FTP allows access without a personal account, typically as user anonymous. That can be intentional for public downloads. It becomes a finding when it exposes internal information, allows writes that should be forbidden, or violates the intended boundary. Examine accessible metadata and approved sample files; do not indiscriminately collect sensitive material.",
      "Connect only to the simulated relay. Our client lists a sanitized archive manifest rather than taking real credentials. The right remediation combines appropriate authentication, least privilege, encrypted transport, and dependency-aware migration. Simply moving the service to an unusual port does not fix its access rules.",
    ],
    objective:
      "Connect to the relay’s FTP service and inspect the anonymous archive manifest.",
    question: "Which remediation addresses the actual exposure?",
    options: [
      "Rename the archive folder.",
      "Use a less familiar port.",
      "Restrict access and migrate to authenticated encrypted transfer.",
    ],
    answer: 2,
    explanation:
      "Obscurity can reduce noise, but it does not enforce who can access data or protect it during transfer.",
    evidence:
      "Anonymous FTP reveals a sanitized continuity manifest and a reference to PALISADE backups.",
    reveal: "The manifest lists seven engineers. Mira’s name is the seventh.",
  },
  {
    id: 7,
    title: "A conversation in fragments",
    subtitle: "Turn packets into a story without reading too much.",
    category: "TRAFFIC ANALYSIS",
    minutes: 20,
    tool: "wireshark",
    command: "filter http",
    intro:
      "The relay makes a short connection every morning. Jun from network operations saved a packet capture. You get one careful look.",
    transmission:
      "Packets are evidence, not an invitation to read everyone’s private life. Filter for the question you’re answering. — Jun",
    concepts: [
      "Packet captures",
      "Wireshark filters",
      "TLS limitations",
      "Sensitive evidence",
    ],
    lesson: [
      "A packet capture records traffic at a point on the network. Packets include addresses, ports, timestamps, and protocol data. Wireshark decodes these layers. A display filter narrows what you see after capture; a capture filter limits what is collected. Neither changes the original meaning of the packets.",
      "Filter this sanitized capture with http to inspect a cleartext request. HTTPS usually hides application content from a passive observer, but IPs, timing, sizes, and some handshake information remain visible. A capture’s vantage point matters: traffic you cannot see may still exist elsewhere.",
      "Build a timeline using source, destination, protocol, and time. Avoid assuming that an unusual connection is malicious without context. Captures may contain personal data, tokens, or passwords, so limit collection, secure storage, and retention. Our trace contains only fictional data.",
    ],
    objective:
      "Apply the HTTP display filter and inspect the relay’s outgoing request.",
    question:
      "What can a passive observer usually read from a properly protected HTTPS session?",
    options: [
      "Every submitted password.",
      "Network metadata, but not the encrypted HTTP content.",
      "Nothing at all, including destination IP addresses.",
    ],
    answer: 1,
    explanation:
      "TLS protects application content. It does not conceal all network metadata, and its protection depends on correct verification and endpoints.",
    evidence:
      "03:17 HTTP request: relay to the continuity archive; trace preserves an employee-ID header.",
    reveal:
      "The request carries X-Meridian-Operator: M-07. Someone is using an identity that should be retired.",
  },
  {
    id: 8,
    title: "Borrowed identity",
    subtitle: "Logging in and being allowed in are different things.",
    category: "IDENTITY",
    minutes: 24,
    tool: "browser",
    command: "inspect session",
    intro:
      "The maintenance portal greets you as a guest. An old session cookie still claims a different role. Is the server actually checking?",
    transmission:
      "Authentication asks who you are. Authorization asks what you may do. The server has to answer both, every time.",
    concepts: [
      "Authentication & sessions",
      "Cookies & flags",
      "MFA & password storage",
      "Server-side authorization",
    ],
    lesson: [
      "Authentication establishes an identity; authorization decides what it can access. A session lets a server recognize later requests after login, often through a cookie containing an unpredictable identifier. Treat a session token like a temporary credential. Logging out should invalidate it on the server, not merely hide the interface.",
      "Secure cookies travel only over HTTPS. HttpOnly prevents JavaScript from reading a cookie, reducing token theft through some script attacks. SameSite limits certain cross-site requests; it is one part of CSRF defense, not a replacement for all authorization or anti-CSRF controls. None of these flags makes a compromised server safe.",
      "Strong identity protection includes unique passwords, suitable password hashing, rate limits, and MFA. Phishing-resistant MFA is stronger than codes that can be relayed. Inspect the mock portal’s session details. A client-side role label must never be trusted as the server’s authorization decision.",
    ],
    objective:
      "Inspect the portal’s session and cookie details. Find the missing protection.",
    question:
      "A button is hidden from guest users. Does that secure its underlying endpoint?",
    options: [
      "Yes, users cannot click it.",
      "Only if the button’s URL is long.",
      "No, the server must enforce permission for the request.",
    ],
    answer: 2,
    explanation:
      "Attackers can construct requests directly. Interface visibility improves usability; authorization must be checked at the server.",
    evidence:
      "Legacy session configuration lacks appropriate cookie protection and retains a stale operator role.",
    reveal:
      "The old operator session was renewed yesterday. Mira asks you to keep that detail off the general channel.",
  },
  {
    id: 9,
    title: "The wrong envelope",
    subtitle: "One changed identifier. One broken trust boundary.",
    category: "ACCESS CONTROL",
    minutes: 22,
    tool: "browser",
    command: "compare invoices",
    intro:
      "The portal stores maintenance invoices. Your guest account can open invoice 1042. A neighboring invoice belongs to someone else.",
    transmission:
      "Keep the test small. Two synthetic records are enough to prove the boundary failed.",
    concepts: [
      "IDOR / BOLA",
      "Object ownership",
      "Trust boundaries",
      "Minimal proof",
    ],
    lesson: [
      "Insecure Direct Object Reference (IDOR), often called Broken Object Level Authorization in APIs, happens when a server accepts an object identifier without checking whether the requesting user may access that object. Sequential IDs make discovery easier, but replacing them with UUIDs does not replace authorization.",
      "In this lab, compare two synthetic invoices. The request changes an identifier while the user identity stays the same. If another user’s object is returned without permission, the ownership boundary failed. Record the two request IDs and a sanitized response difference. You do not need to download an entire customer database.",
      "A robust fix checks the authenticated user’s permission for the specific object on every relevant endpoint and method. Tests should cover both allowed and denied cases across users and tenants. A 200 response alone is not enough: inspect whether it actually contains unauthorized data.",
    ],
    objective:
      "Compare your invoice with the neighboring synthetic record in the portal.",
    question: "What fixes an IDOR vulnerability?",
    options: [
      "Check the requester’s permission for each object on the server.",
      "Make identifiers harder to guess and stop there.",
      "Remove the link from the dashboard.",
    ],
    answer: 0,
    explanation:
      "Unpredictable identifiers can help reduce discovery, but object-level authorization is the control that enforces the boundary.",
    evidence:
      "Synthetic invoice comparison confirms missing object ownership checks in the legacy portal.",
    reveal:
      "The neighboring invoice pays for a server named CHOIR-REHEARSAL. It was approved from inside Meridian.",
  },
  {
    id: 10,
    title: "When words become instructions",
    subtitle: "Understand injection without attacking the real world.",
    category: "APPLICATION SECURITY",
    minutes: 25,
    tool: "browser",
    command: "test search",
    intro:
      "The portal’s search box behaves strangely when you enter punctuation. The underlying problem is more fundamental than a broken search.",
    transmission:
      "Data should stay data. When an application forgets that, a sentence can become an instruction.",
    concepts: [
      "SQL injection",
      "XSS & output encoding",
      "Command injection",
      "Input trust",
    ],
    lesson: [
      "Injection happens when untrusted data is interpreted as instructions. SQL injection changes a database query’s meaning; command injection changes a system command. The core defense is separation: use parameterized queries and safe APIs rather than concatenating untrusted text into instructions. Input validation is useful, but a blacklist of suspicious characters is brittle.",
      "Cross-site scripting (XSS) causes untrusted content to execute in another user’s browser. Its context differs from SQL injection: the remedy includes context-appropriate output encoding, safe rendering, and careful handling of HTML. A Content Security Policy can add defense in depth. React’s normal text rendering escapes content, but unsafe HTML insertion can undo that protection.",
      "Use our mock query inspector to compare concatenation and a parameterized search. The demo represents query behavior in memory; it does not execute SQL or scripts. Learn the trust boundary and the defense, rather than treating one payload as a universal attack.",
    ],
    objective:
      "Inspect the search query and compare the unsafe query with its parameterized form.",
    question: "What is the strongest primary defense against SQL injection?",
    options: [
      "Ban spaces in search terms.",
      "Use parameterized queries that separate data from SQL structure.",
      "Hide database error messages only.",
    ],
    answer: 1,
    explanation:
      "Parameterized queries preserve the distinction between instructions and values. Error handling and validation help, but do not replace that separation.",
    evidence:
      "The search inspector demonstrates string-built queries; parameterized reference behavior captured.",
    reveal:
      "One search result is a note addressed to you: “Ask Mira why the seven became six.”",
  },
  {
    id: 11,
    title: "The commit that stayed",
    subtitle: "Deleted secrets can survive in history.",
    category: "SOURCE & SUPPLY CHAIN",
    minutes: 20,
    tool: "github",
    command: "review commit",
    intro:
      "Jun finds the public mirror of Meridian’s retired maintenance repository. A cleaned-up configuration looks fine. The previous commit doesn’t.",
    transmission:
      "Version control remembers. Removing a secret from today’s file doesn’t remove yesterday’s copy.",
    concepts: [
      "Git history",
      "Secrets exposure",
      "Dependency risk",
      "Secret rotation",
    ],
    lesson: [
      "Git stores snapshots in commits. A secret removed from the current file may remain accessible in older commits, forks, build logs, or caches. A public repository must be treated as already copied. Rewriting history may reduce exposure, but it cannot make an exposed credential trustworthy again.",
      "Review the synthetic commit diff for a hardcoded token. Do not try it against a real service. A correct response revokes or rotates the credential, investigates its use, removes it from active configuration, and improves secret storage and scanning. Environment variables can aid configuration separation but must still be protected from logs and unintended exposure.",
      "Software supply chains include libraries, build tooling, registries, and CI credentials. Lockfiles record resolved versions; signature and checksum verification help validate artifacts. Limit CI permissions and review untrusted changes before letting them access credentials. A vulnerability scanner provides leads, not a complete security judgment.",
    ],
    objective:
      "Review the maintenance commit and identify the credential exposure.",
    question:
      "A token was committed publicly and then deleted. What should happen first?",
    options: [
      "Revoke or rotate the exposed token and investigate its use.",
      "Assume deletion makes it safe.",
      "Copy it into the incident report in full.",
    ],
    answer: 0,
    explanation:
      "An exposed credential is no longer trustworthy. Rotation ends its usefulness; history cleanup alone cannot do that.",
    evidence:
      "Sanitized Git diff records a retired maintenance token in repository history.",
    reveal:
      "The commit author was Mira. The reviewer was an account now named “choir-zero.”",
  },
  {
    id: 12,
    title: "A number isn’t a verdict",
    subtitle: "Match a vulnerability to its actual conditions.",
    category: "VULNERABILITY RESEARCH",
    minutes: 22,
    tool: "cve",
    command: "search CVE-2021-41773",
    intro:
      "The relay reports an old Apache version. An alarming CVE result appears. Mira stops you before you mark it critical.",
    transmission:
      "A headline gives you a hypothesis. Version, configuration, patch state, and reachability give you a finding.",
    concepts: [
      "CVE & CVSS",
      "Affected versions",
      "Patch verification",
      "Risk prioritization",
    ],
    lesson: [
      "A CVE identifies a publicly described vulnerability. CVSS summarizes technical severity under stated assumptions; it is not the same as business risk. The same defect can have different impact on an isolated test system and a public emergency relay. Look for vendor advisories, affected versions, mitigations, and prerequisites.",
      "CVE-2021-41773 concerns a path traversal flaw in Apache HTTP Server 2.4.49 under particular configurations; some configurations can permit code execution. Version 2.4.50’s incomplete fix led to CVE-2021-42013. This lab uses a local advisory summary to teach research, without attempting exploitation.",
      "A banner can be misleading and vendors may backport patches. Confirm the installed package and advisory status through authorized inventory before declaring vulnerability. A good finding states evidence, uncertainty, affected assets, impact, and remediation. Prioritize current reachable risk and verify fixes after deployment.",
    ],
    objective:
      "Find CVE-2021-41773 and examine the affected version and configuration conditions.",
    question: "Does an old-looking version banner prove a host is vulnerable?",
    options: [
      "Yes, version strings are authoritative.",
      "No, all old versions are safe behind TLS.",
      "No, verify affected configuration and actual patch status.",
    ],
    answer: 2,
    explanation:
      "Banners are clues. Backported fixes, inaccurate banners, configuration, and reachability change whether a specific issue applies.",
    evidence:
      "CVE research records the Apache 2.4.49 conditions and the need for package-level patch verification.",
    reveal:
      "The relay’s patch exemption was signed M-07. The exemption expires tonight.",
  },
  {
    id: 13,
    title: "A familiar voice",
    subtitle: "The next attack arrives looking like a colleague.",
    category: "HUMAN LAYER",
    minutes: 20,
    tool: "inbox",
    command: "inspect headers",
    intro:
      "An urgent message from “Mira” tells you to install a relay update before the shift change. It sounds exactly like her. She is standing beside you.",
    transmission:
      "They read our old messages. Familiar language isn’t proof of identity. Verify the request through a separate channel.",
    concepts: [
      "Phishing & pretexting",
      "Email headers",
      "SPF / DKIM / DMARC",
      "Independent verification",
    ],
    lesson: [
      "Phishing uses a deceptive message to persuade someone to disclose information or take an unsafe action. Pretexting gives the request a believable story. Urgency, authority, and familiarity can bypass careful thinking. Inspect the actual address, link destination, attachment context, and request—not just its display name.",
      "SPF checks whether an IP is authorized to send for an envelope domain. DKIM verifies a domain’s signature over selected message content. DMARC applies alignment and policy using SPF or DKIM. These help detect some spoofing, but a message can pass authentication and still be malicious—for example from a compromised account or a lookalike domain.",
      "Open the mock message’s headers and compare the sender with the reply-to address and authentication result. Do not open unknown attachments to find out whether they are dangerous. Verify unexpected high-impact requests through a known separate channel, and preserve the original message for the response team.",
    ],
    objective:
      "Inspect the suspicious update email’s headers and identify the mismatch.",
    question: "A message passes DKIM. Can it still be phishing?",
    options: [
      "Yes. An authenticated sending domain can still send malicious mail.",
      "No. DKIM guarantees the message is safe.",
      "Only if it contains an attachment.",
    ],
    answer: 0,
    explanation:
      "Email authentication establishes specific domain-level facts, not the sender’s intent or the safety of a request.",
    evidence:
      "Update email uses a lookalike reply-to domain and a mismatched authentication trail.",
    reveal:
      "The message quotes something Mira said five minutes ago. The Choir may be listening now.",
  },
  {
    id: 14,
    title: "A fingerprint, not a promise",
    subtitle: "Decide whether an update is the update you expected.",
    category: "CRYPTOGRAPHY",
    minutes: 18,
    tool: "terminal",
    command: "sha256sum update.bin",
    intro:
      "The suspicious update file is quarantined. You can examine its fingerprint without running it. The trusted release record is available through a separate channel.",
    transmission:
      "Don’t run it. First ask whether these are the bytes we approved.",
    concepts: [
      "Hashing vs encryption",
      "Checksums & signatures",
      "Trusted distribution",
      "TLS certificate trust",
    ],
    lesson: [
      "A cryptographic hash maps data to a fixed-size digest. A tiny change in the input should produce a very different digest. Hashing is not encryption: there is no decryption key that restores the original content. A hash is useful for comparing files, but an attacker who can replace both a download and its listed hash can make them agree.",
      "Compare a checksum through an independently trusted source. A digital signature adds a statement that a holder of a particular private key signed the data; verification depends on trusting the correct public key. A matching hash or valid signature establishes particular integrity or authenticity facts, not that software has no vulnerabilities.",
      "Run sha256sum on the quarantined simulated file and compare the output with Meridian’s trusted release digest. Never disable TLS verification or accept an unknown signing key merely to get a download working. Passwords should use purpose-built salted, slow password-hashing algorithms, not a fast general-purpose file hash alone.",
    ],
    objective:
      "Hash the quarantined update and compare it with the trusted release record.",
    question:
      "Why isn’t a matching hash on the same compromised download page enough?",
    options: [
      "SHA-256 always decrypts the file.",
      "An attacker could replace both the file and the displayed hash.",
      "Hashing works only over HTTP.",
    ],
    answer: 1,
    explanation:
      "Integrity checking requires a trustworthy reference. If the same attacker controls both artifacts, matching values do not establish authenticity.",
    evidence:
      "The update fingerprint differs from the approved release. File remains unexecuted.",
    reveal:
      "The forged update would have replaced the city’s emergency routing table.",
  },
  {
    id: 15,
    title: "The sky has doors, too",
    subtitle: "Cloud storage is a permission system, not a hiding place.",
    category: "CLOUD & IDENTITY",
    minutes: 24,
    tool: "terminal",
    command: "audit cloud",
    intro:
      "PALISADE has a cloud backup. The service account keeping it alive has far more access than a backup job should need.",
    transmission:
      "A private-looking bucket name isn’t privacy. Let’s read the policy.",
    concepts: [
      "Cloud IAM",
      "Storage exposure",
      "Least privilege",
      "Network segmentation",
    ],
    lesson: [
      "Cloud security divides responsibilities between provider and customer. The exact boundary depends on the service: a managed database does not mean the provider chooses safe application permissions for you. Identity and Access Management (IAM) governs which principals may perform which actions on which resources, sometimes under additional conditions.",
      "A storage object can be exposed by public policies, shared links, overly broad roles, or application behavior. “Not listed” and “not guessable” are not access controls. Prefer explicit least-privilege permissions, short-lived identities, and carefully reviewed public access blocks. Check effective permissions, including inherited and resource-based policies.",
      "Network segmentation limits how a compromise spreads, but it does not fix an overpowered identity allowed through the boundary. In this sanitized policy audit, inspect the backup role’s wildcard grants and the storage audience. Record the minimum permissions the job actually requires rather than deleting a dependency blindly.",
    ],
    objective:
      "Audit the simulated cloud policy and identify excessive access.",
    question:
      "A backup job only reads one archive. Which grant is appropriate?",
    options: [
      "Administrator access for reliability.",
      "Read access to every company resource.",
      "The necessary read actions on the specific archive, with suitable conditions.",
    ],
    answer: 2,
    explanation:
      "Least privilege limits both accidental damage and an attacker’s reach if the identity is compromised.",
    evidence:
      "PALISADE backup identity has wildcard permissions beyond its single-archive purpose.",
    reveal:
      "The backup account has recently read the live dispatch configuration. The threat is no longer just historical.",
  },
  {
    id: 16,
    title: "03:17",
    subtitle: "The investigation becomes an incident.",
    category: "DETECTION",
    minutes: 25,
    tool: "wireshark",
    command: "filter failed_login",
    intro:
      "Every screen in the operations room flashes amber. It is 03:17. Dozens of logins fail, then one succeeds. The city is still online. For now.",
    transmission:
      "Breathe. Preserve what we know. Look for a sequence, not a single scary event.",
    concepts: [
      "Logs & correlation",
      "Authentication attacks",
      "Indicators vs conclusions",
      "Incident timelines",
    ],
    lesson: [
      "Logs are records produced by systems and applications. Useful fields include timestamp, timezone, actor, source, target, action, and outcome. Missing logging, clock drift, and retention gaps limit conclusions. A SIEM can aggregate and correlate events, but its alerts still require investigation.",
      "Repeated failed logins may indicate password guessing, credential stuffing, user mistakes, or misconfigured software. A success after repeated failures raises concern, particularly with a new source or unusual access. Credential stuffing reuses previously exposed username/password pairs; password spraying tries a few common passwords across many accounts.",
      "Filter this synthetic event stream and connect the failed attempts with the later success. Record facts separately from hypotheses. Preserve original evidence, normalize times, and correlate with service activity. Don’t attribute an attack to a group solely because a message claims its name.",
    ],
    objective:
      "Filter failed login events and trace the subsequent successful session.",
    question: "What is the strongest initial incident observation?",
    options: [
      "“The Choir definitely owns the whole network.”",
      "“Repeated failures were followed by a successful session from the same unusual source.”",
      "“Every failed login is an attacker.”",
    ],
    answer: 1,
    explanation:
      "Specific, time-bound observations support investigation. Broad attribution or compromise claims require additional evidence.",
    evidence:
      "03:17 authentication sequence correlated: failed logins, success, then a routing configuration read.",
    reveal:
      "The successful login belongs to M-07. Mira quietly places her old employee badge on your desk.",
  },
  {
    id: 17,
    title: "Hold the line",
    subtitle: "Contain the threat without switching off the city.",
    category: "INCIDENT RESPONSE",
    minutes: 25,
    tool: "terminal",
    command: "isolate relay-07",
    intro:
      "Mira was PALISADE’s seventh engineer. The project was abandoned; six colleagues disappeared from the company. Someone has kept her old identity alive. Now it is moving toward dispatch.",
    transmission:
      "I should have told you sooner. But that badge isn’t me anymore. Isolate the legacy relay. Keep the dispatch backbone running.",
    concepts: [
      "Containment",
      "Evidence preservation",
      "Eradication & recovery",
      "Availability tradeoffs",
    ],
    lesson: [
      "Incident response commonly covers preparation, detection and analysis, containment, eradication, recovery, and improvement. The stages overlap. Containment limits harm; eradication removes the cause and footholds; recovery restores trusted service. Restoring a compromised system from an unverified backup can restore the compromise too.",
      "Containment choices affect availability and evidence. A controlled network isolation may preserve a host’s state while blocking lateral movement. Powering off can destroy volatile evidence and interrupt service. Follow the approved response plan, involve the service owner, and capture the evidence that can be collected safely without delaying urgent containment.",
      "Our simulation permits isolating Relay 07 while leaving the dispatch backbone on its separate network. This is an approved action in the exercise scope. After containment, revoke the stale identity, investigate persistence, repair the root cause, restore from trusted sources, and monitor for recurrence. Never assume one blocked IP ends an incident.",
    ],
    objective:
      "Apply the approved isolation action to relay-07 and verify dispatch remains online.",
    question: "After isolation, what is still required?",
    options: [
      "Investigate and eradicate the cause, recover safely, and monitor.",
      "Immediately declare the whole incident resolved.",
      "Delete all logs to stop alarming people.",
    ],
    answer: 0,
    explanation:
      "Containment buys time and limits damage. It does not establish that the cause, persistence, or affected identities have been removed.",
    evidence:
      "Relay 07 isolated from dispatch; emergency service health remains green; evidence retained.",
    reveal:
      "The attack stops. A final packet arrives: “Good. You finally found the door. Now ask who built it.”",
  },
  {
    id: 18,
    title: "What matters first",
    subtitle: "Turn a pile of findings into decisions.",
    category: "RISK & REMEDIATION",
    minutes: 22,
    tool: "report",
    command: "prioritize findings",
    intro:
      "Morning returns to Meridian. The relay is quiet. Your notebook is not. Leadership needs to know what to fix today—and why.",
    transmission:
      "We’re not paid to make a frightening list. We’re here to help people make the right next decision.",
    concepts: [
      "Likelihood & impact",
      "Business context",
      "Remediation ownership",
      "Retesting",
    ],
    lesson: [
      "A finding connects a reproducible observation to a security consequence. Risk depends on both likelihood and impact in context: exposure, required access, existing controls, data sensitivity, and service importance. A high CVSS score may require urgent attention, but a lower-scored flaw on critical infrastructure can deserve higher operational priority.",
      "Separate confirmed defects from unverified hypotheses. In our case, the exposed archive and stale identity are observed; the Apache CVE requires patch verification. Assign owners, concrete remediation, and a practical timeframe. Temporary mitigations should have an expiry and a plan for the durable fix.",
      "Choose the urgent identity and access-control work before cosmetic banner changes. Coordinate repairs with service owners, preserve incident evidence, and retest both security and normal service behavior. Closing a ticket is not the same as verifying that the exposure is gone.",
    ],
    objective:
      "Prioritize the three findings by their verified impact on emergency dispatch.",
    question: "Which finding deserves the clearest uncertainty label?",
    options: [
      "The proven anonymous archive access.",
      "The observed stale operator session.",
      "An Apache CVE inferred only from a version banner.",
    ],
    answer: 2,
    explanation:
      "The CVE is a research lead until its affected conditions and patch status are confirmed. Reporting uncertainty makes the report more useful.",
    evidence:
      "Risk register prioritizes stale identity and access boundaries, with CVE patch verification assigned.",
    reveal:
      "One budget line predates PALISADE. The relay was never meant to be retired. It was meant to be forgotten.",
  },
  {
    id: 19,
    title: "Leave a light on",
    subtitle: "The report is where technical work becomes change.",
    category: "REPORTING",
    minutes: 20,
    tool: "report",
    command: "submit report",
    intro:
      "You came here to fix printers. Tonight you helped keep the city speaking. Mira asks for your first report. Across the room, the old relay screen lights up once more.",
    transmission:
      "Tell them what you know, what you don’t, and what they can do about it. That’s how we earn trust.",
    concepts: [
      "Executive summaries",
      "Reproducible evidence",
      "Responsible disclosure",
      "Retest & next steps",
    ],
    lesson: [
      "Write for two audiences. An executive summary explains business impact, scope, and priorities without requiring command-line knowledge. Technical findings include the affected asset, prerequisites, minimal reproduction, sanitized evidence, impact, and actionable remediation. State dates and limitations so the report is not mistaken for a guarantee of future security.",
      "Keep credentials and unnecessary personal data out of the report. Label simulated or redacted material. Share through agreed channels with authorized recipients and follow retention rules. Responsible disclosure coordinates repair and communication; publishing raw details immediately can put other people at risk.",
      "Your final report should distinguish the confirmed identity and archive failures from the unverified CVE lead, explain containment’s effect on dispatch, and assign retesting. Act I ends at a defensible handoff, not a claim of perfect security. You now have a process: permission, observation, hypothesis, controlled test, evidence, remediation, verification.",
    ],
    objective:
      "Assemble and submit a report that includes evidence, uncertainty, remediation, and retesting.",
    question: "What makes a penetration-test report useful?",
    options: [
      "The longest possible list of tool output.",
      "Clear evidence, business impact, actionable remediation, and honest limits.",
      "A promise that no vulnerabilities remain.",
    ],
    answer: 1,
    explanation:
      "A useful report enables decisions and repair. It gives sufficient evidence without overstating coverage or certainty.",
    evidence:
      "Act I report submitted: scope, timeline, confirmed findings, limitations, remediation, and retest plan.",
    reveal:
      "A new message appears: “Mira didn’t build PALISADE to keep us out. She built it to keep something in.” END OF ACT I.",
  },
];
export const toolNames: Record<Tool, string> = {
  terminal: "Terminal",
  browser: "Web inspector",
  shodan: "Exposure index",
  cve: "CVE database",
  github: "Source archive",
  wireshark: "Packet analyzer",
  inbox: "Mail inspector",
  report: "Report builder",
};
export const glossary = [
  [
    "Attack surface",
    "All the interfaces, services, identities, and workflows through which a system may be interacted with. Reduce unnecessary exposure and protect what must remain reachable.",
  ],
  [
    "Authorization",
    "An explicit decision about what an identity may do to a particular resource. This is separate from establishing who the identity is.",
  ],
  [
    "CIA triad",
    "Confidentiality protects information from unauthorized disclosure; integrity protects its correctness; availability keeps it usable when needed.",
  ],
  [
    "CVE",
    "A common identifier for a publicly described vulnerability. It gives you a reference to investigate, rather than proof that a particular asset is affected.",
  ],
  [
    "DNS",
    "The distributed naming system that associates domain names with typed records, including IP addresses and mail destinations.",
  ],
  [
    "Evidence",
    "A preserved observation that supports a conclusion. Record its source, time, scope, and limitations; sanitize sensitive content.",
  ],
  [
    "Least privilege",
    "Give an identity only the access required for its purpose, for only as long as it needs that access.",
  ],
  [
    "Port",
    "A numbered endpoint used by a transport protocol to route traffic to a service on a host. Familiar port numbers are conventions, not proof of the service behind them.",
  ],
  [
    "Session",
    "A mechanism for associating multiple requests with an authenticated context. A session token often functions as a temporary credential.",
  ],
  [
    "TLS",
    "A protocol that protects data in transit and supports endpoint authentication. Correct certificate validation matters; TLS does not repair application logic.",
  ],
  [
    "Trust boundary",
    "The point where information crosses between different levels of trust. Validate and authorize at the receiving side.",
  ],
  [
    "Vulnerability",
    "A weakness that could be used to harm confidentiality, integrity, or availability. Risk depends on its real context and consequences.",
  ],
];
export const threatAtlas = [
  {
    title: "Network, wireless & remote access",
    unlock: 3,
    clue: "Jun’s note: the network boundary is more than the firewall.",
    body: "Switches connect devices within a local network; routers move traffic between networks. Firewalls permit or deny traffic according to policy. A VLAN separates broadcast domains but is not, by itself, a complete security boundary: inter-VLAN routing needs appropriate controls. VPNs encrypt traffic between endpoints and grant a route into a network; they do not make infected endpoints trustworthy. Wireless adds radio reach and the risk of rogue access points, weak shared passwords, insecure onboarding, and trusting a familiar network name. Prefer current WPA2/WPA3 enterprise configurations where appropriate, verify network identities, separate guests and devices, and disable unnecessary services. Assess wireless and remote access only under explicit scope.",
  },
  {
    title: "Endpoints, people & physical access",
    unlock: 1,
    clue: "Mira’s note: a locked server is little help beside an unlocked laptop.",
    body: "Endpoints include workstations, phones, servers, and embedded devices. Their risks include unpatched software, stolen sessions, excessive privilege, unsafe macros, removable media, and untrusted applications. Malware describes malicious software; ransomware aims to extort by denying access or threatening disclosure. EDR can detect and respond to endpoint activity but is not a guarantee of prevention. Physical controls, screen locks, disk encryption, device management, and practiced reporting all matter. Never plug in a found USB device to identify its owner. Mobile apps add permission, local-storage, API, and update concerns; granting an app access to contacts or location creates an additional trust relationship.",
  },
  {
    title: "Web applications & API boundaries",
    unlock: 10,
    clue: "The portal’s margins: every endpoint has its own obligations.",
    body: "APIs expose operations to clients; they need authentication, authorization, validation, limits, and useful logging just as pages do. Mass assignment occurs when a server accepts fields a user should not control, such as an administrative role. CSRF uses a victim’s browser to send an unwanted authenticated action; suitable anti-CSRF tokens and cookie settings help, and state-changing GET requests should be avoided. SSRF tricks a server into fetching unintended locations: constrain destinations and prevent access to internal metadata or services. Path traversal escapes an intended file directory; normalize safely and enforce allowed locations. File uploads need authorization, size and type controls, safe storage, and no unintended execution. CORS governs which browser origins may read cross-origin responses; it is not an authentication or network firewall mechanism.",
  },
  {
    title: "Secrets, passwords & identity lifecycle",
    unlock: 8,
    clue: "An old badge still opens a new door.",
    body: "Identity security includes enrollment, recovery, permission changes, service identities, and offboarding. Disable departed users and stale integrations; expire sessions as well as passwords. Use unique, generated passwords and password managers, monitor breached credentials, rate-limit abuse, and favor phishing-resistant MFA where supported. Password recovery must not be weaker than login. Store passwords with a modern purpose-built algorithm such as Argon2id, a unique salt, and appropriate parameters; file hashing alone is too fast. Secrets belong in appropriate managed storage with access auditing and rotation, never in a public repository or client-side bundle. A hidden frontend variable is still delivered to the user.",
  },
  {
    title: "Cloud, containers & deployment",
    unlock: 15,
    clue: "PALISADE’s deployment checklist has more than one owner.",
    body: "Cloud exposure depends on effective identity policies, resource policies, network paths, and public-access settings. Workload identities should be narrow and short-lived. Metadata endpoints can expose instance identity to a compromised workload, so use supported protections and avoid treating internal reachability as trust. Containers share a host kernel: they are useful isolation, but privileged containers, host mounts, unsafe images, and exposed orchestration credentials can cross that boundary. Scan and update base images, run with the necessary minimal permissions, avoid secrets in image layers, and restrict management interfaces. Development and production need separate credentials, data, and access paths.",
  },
  {
    title: "Data, privacy & resilient recovery",
    unlock: 14,
    clue: "Keeping the city connected means having a way back.",
    body: "Inventory and classify data before choosing controls. Collect only what the business needs, protect access, encrypt appropriately in transit and at rest, and define retention and deletion. Encryption at rest does not stop an authorized compromised account from reading data. Backups need separate access controls and resilient copies; a backup writable by the same compromised identity may be destroyed alongside the original. Recovery plans define acceptable data loss (RPO) and time to restore (RTO). Practice restoration and verify data integrity and application function. A successful backup job is not proof that recovery will work.",
  },
  {
    title: "Testing method & coverage",
    unlock: 18,
    clue: "Your report’s most useful sentence might describe what you did not test.",
    body: "A test plan maps assets, roles, entry points, and business workflows to controlled checks. Black-box testing starts with limited internal knowledge; white-box testing has implementation access; gray-box testing lies between. Automated scanners can find familiar patterns but miss context, logic errors, and unfamiliar flaws. Manual testing also has limits. Combine observation, careful hypotheses, small reproducible tests, and an agreed evidence standard. Scope and rules decide whether denial-of-service, social engineering, or physical tests are permitted; never infer permission from the label “penetration test.” State untested surfaces and unresolved questions instead of promising exhaustive security.",
  },
  {
    title: "Monitoring, response & improvement",
    unlock: 17,
    clue: "The quiet after containment is a beginning.",
    body: "Detection needs useful telemetry from identity, endpoint, network, cloud, and applications, with clocks, protected storage, and retention suited to the investigation. Alerts should have owners and response procedures. Test that a response actually preserves critical service. After an incident, record a timeline, distinguish root causes from contributing conditions, assign corrective work, and verify it. Threat intelligence can add context, but matching a technique or an indicator does not prove an actor’s identity. Share sanitized lessons through approved channels, and use what happened to improve preparation, inventory, and controls.",
  },
];
export const handlerObservations = [
  "I can see the signed scope on your screen. Good. A partner server just appeared in our inventory, but it isn’t on that sheet.",
  "There it is: .choir-note. That dot kept it out of a casual listing, but it didn’t protect the file.",
  "Your DNS answer just came through. Jun is updating the dispatch map and needs to know exactly what we learned.",
  "I see that FTP service answering. The asset register says this machine is retired. Let’s be precise before we alarm anyone.",
  "That indexed banner predates our investigation. Useful. We need to distinguish an old photograph from what is happening now.",
  "You found the archive path. Their crawler instructions were practically a signpost. The team wants to know why that was possible.",
  "Anonymous access is confirmed. Infrastructure suggests hiding it on a different port. I need your recommendation.",
  "I see the M-07 header in the capture. We can read this HTTP conversation. Jun asks what would change if it used HTTPS.",
  "The session has a stale role and missing flags. A developer says the operator button is hidden, so the endpoint must be safe.",
  "Same session. Different owner. That comparison is enough evidence. The developer wants to replace invoice IDs with random strings.",
  "I saw the quote change how the query was parsed. We have an unsafe construction pattern. The developer asks what to fix first.",
  "That old token is still in the diff. The author says the current file is clean. I’m opening a response ticket—what comes first?",
  "The advisory matches the banner, but that’s only part of the story. Infrastructure is asking whether we can call this confirmed.",
  "Those headers don’t match the voice in the message. Nice catch. Imagine the next one has a valid domain signature—do we trust it?",
  "That fingerprint does not match the approved release. The sender insists the hash on their own page matches. Your call.",
  "The backup identity can reach far beyond its job. The cloud team is ready to replace the grant. Tell them the right boundary.",
  "I see the failures, the successful M-07 session, and the routing read. Leadership is on the line. Give them the observation we can defend.",
  "Relay 07 is isolated. Dispatch health is green. We bought ourselves time. Is containment the end of this incident?",
  "The priorities are sensible. Before this goes to leadership, tell me which finding still needs an uncertainty label.",
  "Your assessment is on my screen. Before I hand it to the director: what should this report help them do?",
];
