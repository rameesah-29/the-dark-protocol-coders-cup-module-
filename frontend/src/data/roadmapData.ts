export type GateStatus = 'locked' | 'active' | 'completed' | 'escaped';
export type ZoneType = 'SAFE ZONE' | 'ELIMINATION ZONE' | 'ESCAPE';

export interface GateInfo {
  id: number;
  gateNumber: number;
  title: string;
  doorName?: string;
  shortTitle?: string;
  category: string;
  description: string;
  file: string;
  targetTime: string;
  zoneType: ZoneType;
  accentColor: string; // e.g., '#00d2ff'
  glowColor: string;
  borderColor: string;
  lightBgColor: string;
  doorType: 'iron-chains-eye' | 'matrix-vector' | 'vault-cryptographic' | 'calculus-runes' | 'corrupted-code-red' | 'terminal-purple' | 'portal-escape-light';
  defaultStatus: GateStatus;
  imageUrl: string;
  technicalDetails: {
    objective: string;
    sampleCodeOrSnippet?: string;
    forensicHint?: string;
    unlockKeyName?: string;
    fileContentPreview?: string;
  };
}

export const PRISON_CORRIDOR_BG = '/src/assets/images/prison_corridor_bg_1792087271379.jpg';

export const ROADMAP_GATES: GateInfo[] = [
  {
    id: 1,
    gateNumber: 1,
    title: 'Cell Door Terminal',
    doorName: 'Door 1: Cell Door Terminal',
    shortTitle: 'Cell Door',
    category: 'Digital Forensics',
    description: 'Analyse the corrupted memory image to find hidden strings and decrypt the Nihilist cipher.',
    file: 'Memory_Dump.png',
    targetTime: '15–18 mins',
    zoneType: 'SAFE ZONE',
    accentColor: '#00d2ff',
    glowColor: 'rgba(0, 210, 255, 0.65)',
    borderColor: '#38bdf8',
    lightBgColor: 'rgba(14, 165, 233, 0.12)',
    doorType: 'iron-chains-eye',
    defaultStatus: 'active',
    imageUrl: '/src/assets/images/gate_forensic_blue_1792087272059.jpg',
    technicalDetails: {
      objective: 'Extract volatile memory artifacts, identify steganographic payloads inside PNG ancillary chunks (zTXt/tEXt), and reconstruct the polybius square Nihilist key (5x5 alphabet matrix).',
      sampleCodeOrSnippet: `$ strings Memory_Dump.png | grep -E "NIHILIST|FLAG|KEY"\n0x004F8A: KEY_POLYBIUS = [42, 15, 33, 51, 24]\n0x004F9C: CIPHERTEXT = "67 34 88 56 47 72 91"`,
      forensicHint: 'The scanning eye hologram monitors raw byte parity. Look at the blue channel lower bit-planes.',
      unlockKeyName: 'FORENSIC_KEY_ALPHA',
      fileContentPreview: '[BINARY DUMP: 14.8 MB RAW MEMORY IMAGE WITH STEGANOGRAPHIC NIHILIST CIPHER EMBED]'
    }
  },
  {
    id: 2,
    gateNumber: 2,
    title: 'Cell-Block Corridor Gate',
    doorName: 'Door 2: Cell-Block Corridor Gate',
    shortTitle: 'Corridor',
    category: 'Linear Algebra',
    description: 'Perform matrix-vector multiplication to generate the master command key.',
    file: 'matrix_transform.cpp',
    targetTime: '15–20 mins',
    zoneType: 'SAFE ZONE',
    accentColor: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.7)',
    borderColor: '#34d399',
    lightBgColor: 'rgba(16, 185, 129, 0.12)',
    doorType: 'matrix-vector',
    defaultStatus: 'locked',
    imageUrl: '/src/assets/images/gate_matrix_green_1792087273171.jpg',
    technicalDetails: {
      objective: 'Multiply an 8x8 orthogonal transition matrix T with the quantum seed vector v to discover invariant subspace eigenvalues and compute master command token.',
      sampleCodeOrSnippet: `// matrix_transform.cpp\n#include <vector>\n#include <iostream>\n\nstd::vector<double> multiply(const std::vector<std::vector<double>>& T, const std::vector<double>& v) {\n    std::vector<double> res(T.size(), 0.0);\n    for (size_t i = 0; i < T.size(); ++i) {\n        for (size_t j = 0; j < v.size(); ++j) res[i] += T[i][j] * v[j];\n    }\n    return res;\n}`,
      forensicHint: 'Eigenvectors corresponding to λ = 1 represent the immutable prison gate state vector.',
      unlockKeyName: 'EIGEN_TOKEN_OMEGA',
      fileContentPreview: '// C++ Matrix Kernel: 8x8 Linear Transformation Operator & Inner Product Validator'
    }
  },
  {
    id: 3,
    gateNumber: 3,
    title: 'Security Checkpoint Vault',
    doorName: 'Door 3: Security Checkpoint Vault',
    shortTitle: 'Checkpoint',
    category: 'Cryptography',
    description: 'Decrypt the ADFGVX cipher to unlock the vault and retrieve the next file.',
    file: 'Subsystem_Vault.zip',
    targetTime: '10–12 mins',
    zoneType: 'SAFE ZONE',
    accentColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.75)',
    borderColor: '#fbbf24',
    lightBgColor: 'rgba(245, 158, 11, 0.12)',
    doorType: 'vault-cryptographic',
    defaultStatus: 'locked',
    imageUrl: '/src/assets/images/gate_vault_gold_1792087273604.jpg',
    technicalDetails: {
      objective: 'Undo the German WWI ADFGVX fractionation and columnar transposition cipher using the 6x6 substitution grid with letters A, D, F, G, V, X.',
      sampleCodeOrSnippet: `ADFGVX Grid Key: "HORCRUX"\n   A D F G V X\nA| B C D E F G\nD| H I J K L M\nF| N O P Q R S\nG| T U V W X Y\nV| Z 0 1 2 3 4\nX| 5 6 7 8 9 +\n\nCiphertext: DX FG AG AV FD XA GD VG`,
      forensicHint: 'Rearrange the transposition columns in alphabetical order of the key word to expose the inner ZIP password.',
      unlockKeyName: 'ADFGVX_VAULT_PIN',
      fileContentPreview: '[ENCRYPTED ZIP ARCHIVE: Subsystem_Vault.zip (Contains calc_payload.cpp & token manifests)]'
    }
  },
  {
    id: 4,
    gateNumber: 4,
    title: 'Armory Blast Door',
    doorName: 'Door 4: Armory Blast Door',
    shortTitle: 'Armory',
    category: 'Multivariable Calculus',
    description: 'Solve three control integrals using Lagrange multipliers, Jacobians, and line integrals to obtain the core token.',
    file: 'calc_payload.cpp',
    targetTime: '15–18 mins',
    zoneType: 'ELIMINATION ZONE',
    accentColor: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.75)',
    borderColor: '#60a5fa',
    lightBgColor: 'rgba(59, 130, 246, 0.12)',
    doorType: 'calculus-runes',
    defaultStatus: 'locked',
    imageUrl: '/src/assets/images/gate_calculus_blue_1792087298924.jpg',
    technicalDetails: {
      objective: 'Evaluate ∮_C F · dr around closed loop C using Green’s Theorem, compute the Jacobian determinant of spherical coordinate transformation, and minimize power loss with ∇f = λ∇g.',
      sampleCodeOrSnippet: `∮_C (y^3 dx - x^3 dy) = ∬_R (-3x^2 - 3y^2) dA\nJ(r, θ, φ) = r^2 sin(φ)\nLagrange Constraint: g(x, y, z) = x^2 + y^2 + z^2 - 25 = 0\nMin Token Value = 42 * π`,
      forensicHint: 'Ensure path orientation is counter-clockwise when applying Green’s theorem in the 2D plane.',
      unlockKeyName: 'JACOBIAN_FLUX_SCALAR',
      fileContentPreview: '// High-precision C++ numerical integrator verifying multivariate boundary flux'
    }
  },
  {
    id: 5,
    gateNumber: 5,
    title: 'Yard Isolation Airlock',
    doorName: 'Door 5: Yard Isolation Airlock',
    shortTitle: 'Airlock',
    category: 'Logic & SHA-256 Slicing',
    description: 'override module has been fractured into disconnected logic blocks. Participants must visually rearrange the code snippets, calibrate system parameters using paper math, and extract a sliced hash credential.',
    file: '',
    targetTime: '15–20 Mins (Elimination Zone)',
    zoneType: 'ELIMINATION ZONE',
    accentColor: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.75)',
    borderColor: '#f87171',
    lightBgColor: 'rgba(239, 68, 68, 0.12)',
    doorType: 'corrupted-code-red',
    defaultStatus: 'locked',
    imageUrl: '/src/assets/images/gate_cpp_crimson_1792087299219.jpg',
    technicalDetails: {
      objective: 'Step 3 (Block Rearrangement): Drag and drop code blocks representing sections of override.cpp into proper execution order to repair the broken script logic.\n\nStep 4 (Parameter Injection): Combine the block order sequence with the Round 3 API Token (22218) to compute the seed on paper using Calibration Seed = (Pipeline String mod 10007) + (API Token × Result A), append a checksum, and enter it into the keypad.\n\nStep 5 (Hash Slicing): Compute Start Index = First Block No. + Last Digit of Token to locate the position on the generated 64-character hash, extract a 10-character slice, and reverse it if the calculus sum was even.',
      sampleCodeOrSnippet: `// ROUND 5: Yard Isolation Airlock - Logic, Block Calibration & SHA-256 Slicing\n// Target Time: 15–20 Mins (Elimination Zone)\n\n// Step 3: Block Rearrangement (Visual Drag & Drop)\n// Proper execution sequence: Block #2 (Init) -> Block #4 (Memory) -> Block #1 (Crypto) -> Block #3 (Verify)\nstd::string pipeline_string = "2413";\n\n// Step 4: Parameter Injection & Seed Calculation\nuint64_t api_token = 22218; // From Round 3 API\nuint64_t result_A = 42;     // From Round 4 Calculus Flux\n// Calibration Seed = (Pipeline String mod 10007) + (API Token * Result A)\nuint64_t seed = (2413 % 10007) + (22218 * 42); // = 2413 + 933156 = 935569\nuint32_t checksum = crc32(seed);\n\n// Step 5: Hash Slicing (64-character SHA-256 Hex Digest)\nstd::string raw_hash = sha256_hex(seed); // 64 chars\nint first_block_no = 2;\nint last_digit_token = 8; // from token 22218\nint start_index = first_block_no + last_digit_token; // 2 + 8 = 10\nstd::string hash_slice = raw_hash.substr(start_index, 10); // 10-character slice\n\n// Output Obtained: System Hash a7f9b2c4e1 (Used as Credentials #1 in Round 6 Terminal)\nstd::cout << "OUTPUT_SYSTEM_HASH: a7f9b2c4e1" << std::endl;`,
      forensicHint: 'Output Obtained: System Hash a7f9b2c4e1 (Used as Credentials #1 in Round 6 Terminal).\n\nEstimated Time Required:\n• Code Block Rearrangement: 3–5 minutes\n• Parameter Injection & Seed Calculation: 6–8 minutes (45s lock penalty on errors)\n• Hex-Stream Slicing & Extraction: 5–7 minutes\nTotal: 15–20 minutes.',
      unlockKeyName: 'a7f9b2c4e1',
      fileContentPreview: '// Visual Block Rearrangement & Token 22218'
    }
  },
  {
    id: 6,
    gateNumber: 6,
    title: 'Tower Radio Array',
    doorName: 'Door 6: Tower Radio Array',
    shortTitle: 'Radio Array',
    category: 'Signal Reconstruction & Log Filtering',
    description: 'The radio array controlling the outer perimeter security doors leaked an escape signal from source 10.0.4.17 to an unknown destination on port 4444 during the blackout. Intercept and reassemble the signal to bypass the perimeter sensors.',
    file: '',
    targetTime: '15–18 Mins',
    zoneType: 'ELIMINATION ZONE',
    accentColor: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.75)',
    borderColor: '#c084fc',
    lightBgColor: 'rgba(168, 85, 247, 0.12)',
    doorType: 'terminal-purple',
    defaultStatus: 'locked',
    imageUrl: '/src/assets/images/gate_terminal_purple_1792087299279.jpg',
    technicalDetails: {
      objective: '• Filter Traffic: Keep only source = 10.0.4.17 and port = 4444 (removes noise on ports 80/22/53 and decoy IPs).\n• Deduplicate Retransmissions: Retransmitted sequence numbers are corrupted. Retain only the first packet per sequence number (e.g., keep seq 2 at 02:14:07, drop duplicate at 02:14:11).\n• Sort & Reassemble: Order by sequence parameter (ZXNj → NzMx → YXB1).\n• Decode: Decode joined Base64 payload (ZXNj = esc, NzMx = 731, YXB1 = ape).\n\nDoor 6 Breached: Escape Token esc731ape and destination IP 10.0.9.200 (Required for Credentials #3 in the Door 7 Terminal).',
      sampleCodeOrSnippet: `# Signal Reconstruction & Log Filtering\n# Filter: source == "10.0.4.17" && port == 4444\ntimestamp,source,destination,port,seq,payload_base64\n02:14:02,10.0.4.17,10.0.9.200,4444,1,ZXNj\n02:14:05,10.0.4.88,10.0.9.111,80,9,bm9pc2U=\n02:14:07,10.0.4.17,10.0.9.200,4444,2,NzMx\n02:14:11,10.0.4.17,10.0.9.200,4444,2,NzMx_CORRUPT_DUP\n02:14:15,10.0.4.17,10.0.9.200,4444,3,YXB1\n\n# Reassembled Base64 Stream: ZXNj (esc) + NzMx (731) + YXB1 (ape)\n# Output Token: esc731ape | Destination IP: 10.0.9.200`,
      forensicHint: 'Door 6 Breached: Escape Token esc731ape and destination IP 10.0.9.200 (Required for Credentials #3 in the Door 7 Terminal).',
      unlockKeyName: 'esc731ape',
      fileContentPreview: 'timestamp,source,destination,port,seq,payload_base64\n02:14:02,10.0.4.17,10.0.9.200,4444,1,ZXNj'
    }
  },
  {
    id: 7,
    gateNumber: 7,
    title: 'The Final Breach',
    doorName: 'Door 7: The Final Breach',
    shortTitle: 'Final Escape',
    category: 'Freedom Exit',
    description: 'Override the central perimeter security gate using the Signal Token, System Hash, and Corridor Key to permanently escape The Dark Protocol.',
    file: '',
    targetTime: 'VICTORY ESCAPE',
    zoneType: 'ESCAPE',
    accentColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.95)',
    borderColor: '#e0f2fe',
    lightBgColor: 'rgba(224, 242, 254, 0.15)',
    doorType: 'portal-escape-light',
    defaultStatus: 'locked',
    imageUrl: '/src/assets/images/gate_final_escape_1792087273561.jpg',
    technicalDetails: {
      objective: 'Round VII: The Final Breach! Stage 1: Present the Signal Token from Door 6 (esc731ape) to unseal the perimeter. Stage 2: Provide System Hash from Door 5 (a7f9b2c4e1) and Corridor Key from Door 2 (EIGEN_TOKEN_OMEGA) into the central override terminal to trigger the grand freedom exit.',
      sampleCodeOrSnippet: `#!/usr/bin/env bash\n# ROUND VII: THE FINAL BREACH - CENTRAL PERIMETER OVERRIDE\n# Stage 1: Signal Token (Door 6): esc731ape\n# Stage 2: System Hash (Door 5): a7f9b2c4e1\n# Stage 2: Corridor Key (Door 2): EIGEN_TOKEN_OMEGA\n\necho "[+] INITIATING CENTRAL OVERRIDE PROTOCOL..."\ncurl -X POST "http://10.0.9.200/api/round7/override-gate" \\\n  -d "systemHash=a7f9b2c4e1&corridorKey=EIGEN_TOKEN_OMEGA"\n\necho "[!] PERIMETER GATE UNLOCKED! LOCKDOWN OVERRIDDEN! FREEDOM ATTAINED."`,
      forensicHint: 'Three credentials. One final gate. Escape before the lockdown returns.',
      unlockKeyName: 'OVERRIDE_MAIN_GATE',
      fileContentPreview: '// Round VII: The Final Breach (Perimeter Freedom Exit)'
    }
  }
];
