import { defineComputeConfig } from "@prisma/compute-sdk/config";

export default defineComputeConfig({
  app: {
    name: "llmarena",
    framework: "nextjs",
    httpPort: 3000,
  },
});
