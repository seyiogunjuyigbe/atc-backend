import { getModelForClass } from '@typegoose/typegoose';

import SiteSettingSchema from '../../db/schema/site_setting';

export default class SiteSetting extends SiteSettingSchema { }

export const model = getModelForClass(SiteSetting);
