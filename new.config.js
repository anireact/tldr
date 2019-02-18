/* eslint-env node */

const dedent = require('dedent');
const { Confirm } = require('enquirer');

const lerna = require('./lerna');
const pkg = require('./package');

module.exports = {
    scopes: ['tld'],
    workspaces: ['@tld'],
    repository: pkg.repository,
    homepage: (name, workspace) => `https://github.com/anireact/tld/tree/master/${workspace}/${name}`,
    bugs: (name, workspace) => `https://github.com/anireact/tld/issues?q=is:issue+label:${workspace}/${name}`,
    author: pkg.author,
    context: __dirname,
    version: lerna.version,
    private: false,
    license: 'MIT',
    main: 'dist/index.js',
    package: x => ({
        ...x,
        types: x.main.replace(/\.js$/u, '.d.ts'),
        scripts: {
            'build:babel': 'babel --source-maps --out-dir dist --extensions .ts src',
            'build:tsc': 'tsc --declaration --emitDeclarationOnly --outDir dist --pretty --rootDir src',
            build: 'yarn build:babel && yarn build:tsc',
        },
    }),
    finalize: async pkg_ => {
        const add = await new Confirm({
            message: 'Add to Git:',
            initial: true,
        }).run();

        return [
            { root: true, run: ['yarn'] },
            ['yarn', 'add', '@babel/runtime', 'core-js'],
            {
                file: 'README.md',
                // language=Markdown
                data: dedent`
                    # ${pkg_.name}

                    > ${pkg_.description}

                    ## License

                    MIT`,
            },
            {
                file: 'babel.config.js',
                data: `
                    module.exports = require('../../babel.config');
                `,
            },
            {
                file: 'tsconfig.json',
                data: {
                    extends: '../../tsconfig.json',
                    compilerOptions: {
                        rootDir: 'src',
                        outDir: 'dist',
                    },
                    exclude: ['dist'],
                },
            },
            ['mkdirp', 'src'],
            ['prettier', '--write', './**/*.{js,jsx,ts,tsx,css,less,scss,html,json,md}'],
            add && ['git', 'add', './*'],
        ];
    },
};