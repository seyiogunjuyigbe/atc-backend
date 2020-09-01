module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('activities', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      vendorId: {
        type: Sequelize.INTEGER,
      },
      dayNumber: {
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.STRING,
      },
      bestVisitTime: {
        type: Sequelize.STRING,
      },
      bestVisitSeason: {
        type: Sequelize.STRING,
      },
      bestVisitWeather: {
        type: Sequelize.STRING,
      },
      calendarStatus: {
        type: Sequelize.STRING,
      },
      hasAccomodation: {
        type: Sequelize.BOOLEAN,
      },
      hasMeals: {
        type: Sequelize.BOOLEAN,
      },
      start: {
        type: Sequelize.DATE,
      },
      end: {
        type: Sequelize.DATE,
      },
      countries: {
        type: Sequelize.STRING,
      },
      adventureCategories: {
        type: Sequelize.STRING,
      },
      sightCategories: {
        type: Sequelize.STRING,
      },
      mainDestinationCity: {
        type: Sequelize.STRING,
      },
      mainDestinationCountry: {
        type: Sequelize.STRING,
      },
      pictures: {
        type: Sequelize.STRING,
      },
      videos: {
        type: Sequelize.STRING,
      },
      route: {
        type: Sequelize.STRING,
        values: ['start', 'end', 'day'],
      },
      stops: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('activities');
  },
};
