const { model: User } = require('../../app/models/user');
const { model: SiteSetting } = require('../../app/models/site_setting');

export default async function initializeAdminUser() {
  try {
    console.log('****************** SEEDING ADMIN USER ********************');
    let adminInitialized = await SiteSetting.findOne({
      optionKey: 'setup-admin',
    });

    if (!adminInitialized) {
      adminInitialized = await SiteSetting.create({
        optionKey: 'setup-admin', optionValue: 'false',
      });
    }

    if (adminInitialized.optionValue === 'true') {
      console.log('Admin already initialized');
    } else {
      const superadmin = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@user.com',
        password: 'P4S$word',
        emailVerified: true,
        role: 'admin',
        phone: '08130940297',
      });

      await adminInitialized.updateOne({ optionValue: 'true' });

      console.log('Admin initialized successfully');
    }
    console.log('****************** DONE ********************');
  } catch (err) {
    throw new Error(`Error initializing admin user:  ${err.message}`);
  }
}
