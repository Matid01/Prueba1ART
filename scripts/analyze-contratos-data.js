// This script analyzes contracts data.
// It reads the Contratos_Mensuales_Productor.csv data and calculates the total contracts per producer.

const fs = require("fs")
const path = require("path")
const { parse } = require("csv-parse")

async function analyzeContratosData() {
  const filePath = path.join(process.cwd(), "data", "Contratos_Mensuales_Productor.csv")

  try {
    const fileContent = await fs.promises.readFile(filePath, { encoding: "utf-8" })

    console.log("Analyzing contracts data...")

    parse(
      fileContent,
      {
        columns: true,
        skip_empty_lines: true,
      },
      (err, records) => {
        if (err) {
          console.error("Error parsing CSV:", err)
          return
        }

        const producerContracts = {}

        records.forEach((record) => {
          const codigoProductor = record.codigoProductor
          const totalContratos = Number.parseInt(record.TotalContratos, 10)

          if (codigoProductor && !isNaN(totalContratos)) {
            if (!producerContracts[codigoProductor]) {
              producerContracts[codigoProductor] = 0
            }
            producerContracts[codigoProductor] += totalContratos
          }
        })

        console.log("Total Contracts per Producer:")
        for (const producerCode in producerContracts) {
          console.log(`Producer ${producerCode}: ${producerContracts[producerCode]} contracts`)
        }
      },
    )
  } catch (error) {
    console.error("Error reading or processing file:", error)
  }
}

// Execute the analysis
analyzeContratosData()
