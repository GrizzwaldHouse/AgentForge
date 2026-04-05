
export class ExtractJobUseCase {
  execute(description: string) {
    return {
      skills: [],
      tools: [],
      responsibilities: [],
      hiddenSignals: []
    };
  }
}
