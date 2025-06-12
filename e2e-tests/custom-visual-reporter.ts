import {
  type Reporter,
  type TestCase,
  type TestResult,
} from "@playwright/test/reporter";
import fs from "fs";
import path from "path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

class VisualRegressionReporter implements Reporter {
  private options = {
    outputDir: "test-results/visual-diffs",
    keepFailedSnapshots: true,
    generateDiff: true,
  };
  onBegin() {
    if (!fs.existsSync(this.options.outputDir))
      fs.mkdirSync(this.options.outputDir, { recursive: true });
  }

  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === "failed")
      for (const attachment of result.attachments)
        if (["expected", "actual", "diff"].includes(attachment.name || ""))
          this.handleVisualRegression(test, result, attachment);
  }

  private handleVisualRegression(
    test: TestCase,
    result: TestResult,
    attachment: { name?: string; body?: Buffer }
  ) {
    if (!attachment.name || !attachment.body) return;

    const testTitlePath = test.titlePath();
    const safeTestName = testTitlePath
      .join("_")
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    const outputPath = path.join(this.options.outputDir, safeTestName);
    if (!fs.existsSync(outputPath))
      fs.mkdirSync(outputPath, { recursive: true });

    if (attachment.name === "actual" && this.options.keepFailedSnapshots) {
      const actualPath = path.join(outputPath, `actual_${timestamp}.png`);
      fs.writeFileSync(actualPath, attachment.body);
    }

    if (attachment.name === "expected" && this.options.keepFailedSnapshots) {
      const expectedPath = path.join(outputPath, `expected_${timestamp}.png`);
      fs.writeFileSync(expectedPath, attachment.body);
    }

    if (
      attachment.name === "diff" ||
      (attachment.name === "actual" && this.options.generateDiff)
    ) {
      const expectedAttachment = result.attachments.find(
        ({ name }) => name === "expected"
      );
      const actualAttachment = result.attachments.find(
        ({ name }) => name === "actual"
      );

      if (expectedAttachment?.body && actualAttachment?.body)
        this.generateAndSaveDiff(
          expectedAttachment.body,
          actualAttachment.body,
          path.join(outputPath, `diff_${timestamp}.png`)
        );
    }
  }

  private generateAndSaveDiff(
    expectedBuffer: Buffer,
    actualBuffer: Buffer,
    diffPath: string
  ) {
    try {
      const expectedImg = PNG.sync.read(expectedBuffer);
      const actualImg = PNG.sync.read(actualBuffer);

      if (
        expectedImg.width !== actualImg.width ||
        expectedImg.height !== actualImg.height
      ) {
        console.warn(
          `Cannot generate diff for ${diffPath} - images have different dimensions`
        );
        return;
      }

      const { width, height } = expectedImg;
      const diff = new PNG({ width, height });

      pixelmatch(expectedImg.data, actualImg.data, diff.data, width, height, {
        threshold: 0.1,
      });

      fs.writeFileSync(diffPath, PNG.sync.write(diff));
    } catch (error) {
      console.error(`Failed to generate diff image at ${diffPath}:`, error);
    }
  }
}

export default VisualRegressionReporter;
