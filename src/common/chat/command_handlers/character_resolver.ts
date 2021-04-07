import {Autocompleter} from '_common/chat/autocompleter';
import {CharacterSheetCache} from '_common/chat/command_handlers/sheet_cache';
import {CharacterSheetData} from '_common/chat/command_handlers/types';
import {notUndefined} from '_common/verification';

export class CharacterResolver {
  static create(cache: CharacterSheetCache): CharacterResolver {
    const resolver = new CharacterResolver(cache);
    cache.addListener((result) => {
      resolver.onNewCharacter(result.loadedData.name.toLowerCase());
      if (result.removedName) {
        console.log('TODO: handle character removal');
      }
    });
    cache.getNames().forEach((name) => resolver.onNewCharacter(name));
    return resolver;
  }

  private readonly completer = Autocompleter.create();

  constructor(private readonly cache: CharacterSheetCache) {}

  private onNewCharacter(name: string): void {
    this.completer.addOption(name);
  }

  complete(namePrefix: string): CharacterSheetData[] {
    return this.completer
      .getOptions(namePrefix)
      .map((name) => this.cache.getDataForName(name))
      .filter(notUndefined);
  }
}
