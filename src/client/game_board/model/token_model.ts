import {Location} from '_common/coordinates';
import {getId} from '_client/common/id_generator';
import {
  RemoteTokenDiff,
  RemoteTokenModel,
} from '_common/board/remote_board_model';
import {LoadedImage, loadImage} from '_client/utils/image_utils';
import {checkDefined} from '_common/preconditions';
import {maybeMerge, prefer} from '_common/verification';

/** Data model for a token on the game board. */
export class TokenModel {
  static create(
    name: string,
    image: LoadedImage,
    size: number,
    location: Location,
    isActive: boolean,
    speed: number
  ): TokenModel {
    console.log('Warning - creating new TokenModel!');
    const inner: RemoteTokenModel = {
      id: getId(),
      location: location,
      name: name,
      imageSource: image.source,
      size: size,
      speed: speed,
    };
    return new TokenModel(inner, image.image, isActive);
  }

  /** Returns a duplicate of this token with a different id. */
  static duplicate(model: TokenModel) {
    return this.create(
      model.inner.name,
      new LoadedImage(model.image, model.inner.imageSource),
      model.inner.size,
      model.inner.location,
      model.isActive,
      model.inner.speed
    );
  }

  /**
   * Creates a new model by merging with the partial model. Any fields in
   * the partial model will take precedence.
   */
  static merge(model: TokenModel, diff: TokenDiff) {
    const inner = maybeMerge(
      model.inner,
      diff.inner,
      RemoteTokenModel.mergedWith
    );
    return new TokenModel(
      inner,
      prefer(diff.image, model.image),
      prefer(diff.isActive, model.isActive)
    );
  }

  /**
   * Convenience method that returns a new instance from a remote model and a
   * map of images sources to loaded images.
   *
   * @throws if the image sources defined in the remote model are not
   * present in the map.
   */
  static fromRemoteAndMap(
    model: RemoteTokenModel,
    imageMap: Map<string, CanvasImageSource>
  ): TokenModel {
    const image = checkDefined(imageMap.get(model.imageSource));
    const loadedImage = new LoadedImage(image, model.imageSource);
    return TokenModel.fromRemoteAndImage(model, loadedImage);
  }

  /**
   * Convenient method to create a new instance from a remote model.
   * Loads images defined inside the remote model.
   */
  static async fromRemote(model: RemoteTokenModel): Promise<TokenModel> {
    const loadedImage = await loadImage(model.imageSource);
    return TokenModel.fromRemoteAndImage(model, loadedImage);
  }

  private static fromRemoteAndImage(
    model: RemoteTokenModel,
    loadedImage: LoadedImage
  ): TokenModel {
    return new TokenModel(model, loadedImage.image, false);
  }

  constructor(
    readonly inner: RemoteTokenModel,
    readonly image: CanvasImageSource,
    readonly isActive: boolean
  ) {}

  equals(other: TokenModel): boolean {
    if (this.isActive != other.isActive) {
      return false;
    }
    return RemoteTokenModel.equals(this.inner, other.inner);
  }
}

export interface TokenDiff {
  inner?: RemoteTokenDiff;
  image?: CanvasImageSource;
  isActive?: boolean;
}
