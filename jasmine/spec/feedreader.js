/* feedreader.js
 *
 * This is the spec file that Jasmine will read and contains
 * all of the tests that will be run against your application.
 */

/* We're placing all of our tests within the $() function,
 * since some of these tests may require DOM elements. We want
 * to ensure they don't run until the DOM is ready.
 */
$(function() {
   /* This is our first test suite - a test suite just contains
   * a related set of tests. This suite is all about the RSS
   * feeds definitions, the allFeeds variable in our application.
   */
   describe('RSS Feeds', function() {
      /* This is our first test - it tests to make sure that the
       * allFeeds variable has been defined and that it is not
       * empty. Experiment with this before you get started on
       * the rest of this project. What happens when you change
       * allFeeds in app.js to be an empty array and refresh the
       * page?
       */
      it('are defined', function() {
         expect(allFeeds).toBeDefined();
         expect(allFeeds.length).not.toBe(0);
      });

      /* TODO: Write a test that loops through each feed
       * in the allFeeds object and ensures it has a URL defined
       * and that the URL is not empty.
       */
      it('each feed has a URL', function() {
         allFeeds.forEach(function(feed) {
            // test that the property exists on the object
            expect(feed.url).toBeDefined();

            // test that it's a string
            expect(feed.url).toEqual(jasmine.any(String));

            // test that the string is not empty
            expect(feed.url.length).toBeGreaterThan(0);

            // test that it's a http/https URI
            expect(feed.url).toMatch(/^(http|https):\/\//);
         });
      });

      /* TODO: Write a test that loops through each feed
       * in the allFeeds object and ensures it has a name defined
       * and that the name is not empty.
       */
      it('each feed has a name', function() {
         allFeeds.forEach(function(feed) {
            // test that the property exists on the object
            expect(feed.url).toBeDefined();

            // test that it's a string
            expect(feed.url).toEqual(jasmine.any(String));

            // test that the string is not empty
            expect(feed.url.length).toBeGreaterThan(0);
         });
      });
   });

   /* TODO: Write a new test suite named "The menu" */
   describe('The menu', function() {
      const body = $('body');

      /* TODO: Write a test that ensures the menu element is
       * hidden by default. You'll have to analyze the HTML and
       * the CSS to determine how we're performing the
       * hiding/showing of the menu element.
       */
      // if body has a class of .menu-hidden so be it hidden
      // https://devhints.io/jasmine

      it('should normally be hidden', function() {
         expect(body.hasClass('menu-hidden')).toBeTruthy();
      });

      /* TODO: Write a test that ensures the menu changes
       * visibility when the menu icon is clicked. This test
       * should have two expectations: does the menu display when
       * clicked and does it hide when clicked again.
       */

      it('menu should toggle values when clicked', function() {
         const menuBurger = $('.menu-icon-link');

         // Click the menu and verify it changes state
         menuBurger.click();
         expect(body.hasClass('menu-hidden')).toBeFalsy();

         // If it is clicked again, it should toggle back to normal state
         menuBurger.click();
         expect(body.hasClass('menu-hidden')).toBeTruthy();
      });
   });


   /* TODO: Write a new test suite named "Initial Entries" */
   describe('Initial Entries', function() {
      const arrayFeedIndex = 1;
      const articleTitle = $('.header-title');

      beforeEach(function(done) {
         loadFeed(arrayFeedIndex, function() {
            done();
         });
      });

      /* TODO: Write a test that ensures when the loadFeed
       * function is called and completes its work, there is at least
       * a single .entry element within the .feed container.
       * Remember, loadFeed() is asynchronous so this test will require
       * the use of Jasmine's beforeEach and asynchronous done() function.
       */
      it('verify at least a single item in feed container', function(done) {
         const articles = $('.feed').find('.entry');

         // Does one exist?
         expect(articles).toBeDefined();

         // It must have a length
         expect(articles.length).toBeGreaterThan(0);

         // and must match the appropriate title
         expect(articleTitle.text()).toEqual(allFeeds[arrayFeedIndex].name);

         done();
      });
   });
   /* TODO: Write a new test suite named "New Feed Selection" */
   describe('New Feed Selection', function() {
      const articleTitle = $('.header-title');
      const arrayFeedIndex = 2;

      beforeEach(function(done) {
         loadFeed(arrayFeedIndex, function() {
            done();
         });
      });

      /* TODO: Write a test that ensures when a new feed is loaded
       * by the loadFeed function that the content actually changes.
       * Remember, loadFeed() is asynchronous.
       */

      it('verify the second feed is not the same as the first', function(done) {
         const articles = $('.feed').find('.entry');

         // Does one exist?
         expect(articles).toBeDefined();

         // It must have a length
         expect(articles.length).toBeGreaterThan(0);

         // and must match the appropriate title
         expect(articleTitle.text()).toEqual(allFeeds[arrayFeedIndex].name);

         // TODO: >>>>>> but it must not be identical to the first feed <<<<<<<<
         expect(articleTitle.text()).not.toEqual(allFeeds[1].name);

         done();
      });


   });
}());
