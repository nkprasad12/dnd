import {TokenData} from '_common/board/token_data';
import {StorageCache} from '_server/storage/cache';
import {CacheItemFactory} from '_server/storage/cache_item';
import {storageUtil} from '_server/storage/storage_util';

class CachedTokenFactory extends CacheItemFactory<TokenData> {
  constructor() {
    super('CachedTokenFactory', storageUtil().loadFromFile);
  }
  validate(item: any): item is TokenData {
    return TokenData.isValid(item);
  }
  correct(item: any): void {
    return TokenData.fillDefaults(item);
  }
}

// TODO: Pull the storage out of this class in favor of a testable
//       storage interface.
export function createTokenCache(): StorageCache<TokenData> {
  return StorageCache.create<TokenData>(
    'TokenData',
    new CachedTokenFactory(),
    (key, data) => storageUtil().saveToFile(JSON.stringify(data), key)
  );
}
