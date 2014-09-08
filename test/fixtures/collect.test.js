var fs = require('fs'),
    path = require('path'),
    should = require('should'),
    ineed = require('../../index');


//Test data
var html = fs.readFileSync(path.join(__dirname, '../data/src.html')).toString(),
    emptyHtml = '';


//Utils
function removeSpaces(str) {
    return str.replace(/\s/g, '');
}


//Tests
describe('.collect', function () {

    it('.comments: should collect HTML comment strings', function () {
        var collector = ineed.collect.comments;

        collector.fromHtml(html).comments.should.eql([
            'Comment1', 'Comment3', 'Comment2'
        ]);

        collector.fromHtml(emptyHtml).comments.should.be.empty;
    });

    it('.cssCode: should collect CSS code in <style> tags', function () {
        var collector = ineed.collect.cssCode;

        collector.fromHtml(html).cssCode.map(removeSpaces).should.eql([
            '.yo>dawg{background-color:red;}',
            '.hey{color:blue;font-size:42px;}'
        ]);

        collector.fromHtml(emptyHtml).cssCode.should.be.empty;
    });

    it('.hyperlinks: should collect URL and text of the hyperlinks', function () {
        var collector = ineed.collect.hyperlinks,
            expected = [
                {
                    href: 'http://www.yo.dawg/come/get/some',
                    text: 'ullamco laboris'
                },
                {
                    href: 'http://www.go.away/',
                    text: 'reprehenderit in voluptate'
                }
            ];

        collector.fromHtml(html).hyperlinks.should.eql([
            {
                href: 'http://www.yo.dawg/come/get/some',
                text: 'ullamco laboris'
            },
            {
                href: 'http://www.go.away/',
                text: 'reprehenderit in voluptate'
            }
        ]);

        collector.fromHtml(emptyHtml).hyperlinks.should.be.empty;
    });

    it('.images: should collect URL and "alt" attribute of the images', function () {
        var collector = ineed.collect.images;

        collector.fromHtml(html).images.should.eql([
            {
                src: 'http://www.test.test/puppy/images/kitty.jpg',
                alt: ''
            },
            {
                src: 'http://www.yo.dawg/images/kitty.jpg',
                alt: 'img1'
            }
        ]);

        collector.fromHtml(emptyHtml).images.should.be.empty;
    });

    it('.jsCode: should collect JavaScript in <script> tags', function () {
        var collector = ineed.collect.jsCode;

        collector.fromHtml(html).jsCode.map(removeSpaces).should.eql([
            'while(true&&a<b){useJQuery();}',
            'functionbuildBeautifulApps(){returncreateNgFactoryServiceProviderSingletonMock();}'
        ]);

        collector.fromHtml(emptyHtml).jsCode.should.be.empty;
    });

    it('.scripts: should collect <script> "src" attributes', function () {
        var collector = ineed.collect.scripts;

        collector.fromHtml(html).scripts.should.eql([
            'http://www.yo.dawg/scripts/awesomelib.js',
            'http://www.yo.dawg/iheard/scripts/coollib.js'
        ]);

        collector.fromHtml(emptyHtml).scripts.should.be.empty;
    });

    it('.stylesheets: should collect <link> "href" attributes', function () {
        var collector = ineed.collect.stylesheets;

        collector.fromHtml(html).stylesheets.should.eql([
            'http://www.yo.dawg/css/beauty.css',
            'http://www.test.test/css/beauty.css'
        ]);

        collector.fromHtml(emptyHtml).stylesheets.should.be.empty;
    });

    it('.texts: should collect texts', function () {
        var collector = ineed.collect.texts;

        collector.fromHtml(html).texts.map(removeSpaces).should.eql([
            'Yo!',
            'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ' +
            'ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation',
            'ullamco laboris',
            'nisi ut aliquip ex ea commodo consequat.',
            'Duis aute irure dolor in',
            'reprehenderit in voluptate',
            'velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, ' +
            'sunt in culpa qui officia deserunt mollit anim id est',
            'laborum',
            '.'
        ].map(removeSpaces));

        collector.fromHtml(emptyHtml).texts.should.be.empty;
    });

    it('.title: should collect page title', function () {
        var collector = ineed.collect.title;

        collector.fromHtml(html).title.should.eql('Yo!');
        collector.fromHtml(emptyHtml).title.should.be.empty;
    });

    it('should support plugin chaining and ignore duplicate plugins', function () {
        var collector = ineed.collect
                .images
                .scripts
                .stylesheets,
            result = collector.fromHtml(html);

        //NOTE: check that chaining doesn't affect individual results
        result.images.should.eql(ineed.collect.images.fromHtml(html).images);
        result.scripts.should.eql(ineed.collect.scripts.fromHtml(html).scripts);
        result.stylesheets.should.eql(ineed.collect.stylesheets.fromHtml(html).stylesheets);

        //NOTE: check that duplicate plugins are ignored
        collector
            .images
            .scripts
            .stylesheets
            .fromHtml(html).should.eql(result);
    });
});
