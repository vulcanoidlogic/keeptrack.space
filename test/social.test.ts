import { SocialMedia } from '@app/js/plugins/social/social';
import { TopMenu } from '@app/js/plugins/top-menu/top-menu';
import { setupMinimumHtml } from './environment/standard-env';
import { standardPluginSuite } from './generic-tests';

describe('social_media_plugin', () => {
  beforeEach(() => {
    setupMinimumHtml();
    const topMenuPlugin = new TopMenu();
    topMenuPlugin.init();
  });

  standardPluginSuite(SocialMedia, 'SocialMedia');
});
