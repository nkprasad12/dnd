import {BoardClient} from '_client/game_board/remote/board_client';
import {RemoteTokenModel} from '_common/board/remote_board_model';
import {TokenData} from '_common/board/token_data';

export class RemoteCache {
  private static instance: RemoteCache | undefined = undefined;
  static get(): RemoteCache {
    if (this.instance === undefined) {
      this.instance = new RemoteCache();
    }
    return this.instance;
  }

  private cachedTokens: Promise<TokenData[]> | undefined;

  private constructor() {}

  async getAllTokens(): Promise<TokenData[]> {
    if (this.cachedTokens === undefined) {
      const client = await BoardClient.get();
      this.cachedTokens = client.requestAllTokens();
    }
    return this.cachedTokens;
  }

  async updateTokens(updateTokens: RemoteTokenModel[]): Promise<void> {
    if (this.cachedTokens === undefined) {
      // No-op in this case. When we eventually fetch all tokens,
      // these new tokens should also be included in the
      return;
    }
    const tokenMap: Map<string, TokenData> = new Map();
    for (const token of await this.cachedTokens) {
      tokenMap.set(token.id, token);
    }
    for (const token of updateTokens) {
      tokenMap.set(token.id, token);
    }
    this.cachedTokens = Promise.resolve(Array.from(tokenMap.values()));
  }
}
