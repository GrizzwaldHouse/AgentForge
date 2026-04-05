
import { Agent } from "../../core/interfaces/Agent";

export class TestAgent implements Agent {
  id = "tester";
  name = "TestAgent";

  async execute(input: any) {
    return {
      success: true,
      logs: ["TestAgent executed"],
      data: input
    };
  }
}
