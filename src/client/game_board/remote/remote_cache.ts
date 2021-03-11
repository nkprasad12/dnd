import {BoardClient} from '_client/game_board/remote/board_client';
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
}
