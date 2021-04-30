/* istanbul ignore file: need to fake out the toast library to test this. */

import toast, {ToastOptions} from 'react-hot-toast';
import {Singleton} from '_common/util/dependency/dependency';

export enum FeedbackType {
  PENDING,
  ERROR,
  SUCCESS,
}

export enum FeedbackChannel {
  USER_ACTION,
  BOARD_LOAD,
}

export type ToastHandler = (message: string, options?: ToastOptions) => string;

export class UserFeedback {
  private channelIds: Map<FeedbackChannel, string> = new Map();

  show(channel: FeedbackChannel, type: FeedbackType, message: string): void {
    const channelId = this.channelIds.get(channel);
    if (channelId === undefined) {
      this.channelIds.set(channel, this.getHandler(type)(message));
      return;
    }
    this.getHandler(type)(message, {id: channelId});
  }

  private getHandler(type: FeedbackType): ToastHandler {
    if (type === FeedbackType.PENDING) {
      return toast.loading;
    }
    if (type === FeedbackType.ERROR) {
      return toast.error;
    }
    if (type == FeedbackType.SUCCESS) {
      return toast.success;
    }
    return toast.success;
  }
}

export namespace UserFeedback {
  export const get = Singleton.create(() => new UserFeedback());
}
