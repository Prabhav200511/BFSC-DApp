const fs = require("fs");
const path = require("path");
const solc = require("solc");

const rootDir = path.resolve(__dirname, "..");
const contractPath = path.join(rootDir, "src", "contracts", "PDS.sol");
const artifactPath = path.join(rootDir, "src", "abis", "PDS.json");

const source = fs.readFileSync(contractPath, "utf8");
const existingArtifact = fs.existsSync(artifactPath)
  ? JSON.parse(fs.readFileSync(artifactPath, "utf8"))
  : {};

const input = {
  language: "Solidity",
  sources: {
    "PDS.sol": {
      content: source
    }
  },
  settings: {
    optimizer: {
      enabled: false,
      runs: 200
    },
    outputSelection: {
      "*": {
        "*": [
          "abi",
          "evm.bytecode",
          "evm.deployedBytecode",
          "evm.methodIdentifiers",
          "metadata",
          "devdoc",
          "userdoc"
        ],
        "": ["ast"]
      }
    }
  }
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const errors = output.errors || [];
const fatalErrors = errors.filter((error) => error.severity === "error");

errors.forEach((error) => {
  console.log(error.formattedMessage.trim());
});

if (fatalErrors.length > 0) {
  process.exitCode = 1;
  throw new Error("Solidity compilation failed.");
}

const compiled = output.contracts["PDS.sol"].PDS;
const artifact = {
  ...existingArtifact,
  contractName: "PDS",
  abi: compiled.abi,
  metadata: compiled.metadata,
  bytecode: `0x${compiled.evm.bytecode.object}`,
  deployedBytecode: `0x${compiled.evm.deployedBytecode.object}`,
  immutableReferences: compiled.evm.bytecode.immutableReferences || {},
  generatedSources: compiled.evm.bytecode.generatedSources || [],
  deployedGeneratedSources: compiled.evm.deployedBytecode.generatedSources || [],
  sourceMap: compiled.evm.bytecode.sourceMap,
  deployedSourceMap: compiled.evm.deployedBytecode.sourceMap,
  source,
  sourcePath: contractPath,
  ast: output.sources["PDS.sol"].ast,
  compiler: {
    name: "solc",
    version: solc.version()
  },
  networks: existingArtifact.networks || {},
  schemaVersion: existingArtifact.schemaVersion || "3.4.16",
  updatedAt: new Date().toISOString(),
  networkType: existingArtifact.networkType || "ethereum",
  devdoc: compiled.devdoc || { kind: "dev", methods: {}, version: 1 },
  userdoc: compiled.userdoc || { kind: "user", methods: {}, version: 1 }
};

fs.writeFileSync(artifactPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`Compiled PDS with ${solc.version()}`);
console.log(`Updated ${artifactPath}`);
