const gulp = require('gulp'),
    sass = require('gulp-sass'),
    csso = require('gulp-csso'),
    gutil = require('gulp-util'),
    clean = require('gulp-clean'),
    merge = require('merge-stream'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    rename = require("gulp-rename"),
    uglify = require('gulp-uglify'),
    connect = require('gulp-connect'),
    ghPages = require('gulp-gh-pages'),
    imagemin = require('gulp-imagemin'),
    sourcemaps = require('gulp-sourcemaps'),
    minifyHTML = require('gulp-minify-html'),
    spritesmith = require('gulp.spritesmith'),
    autoprefixer = require('gulp-autoprefixer'),
    fileinclude = require('gulp-file-include'),
    browserSync = require('browser-sync').create();

// browserSync.init({notify: false});

// запуск сервера
gulp.task('server', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        },
        port: "7777"
    });

    gulp.watch(['./**/*.html']).on('change', browserSync.reload);
    gulp.watch('./js/**/*.js').on('change', browserSync.reload);

    gulp.watch([
        './templates/**/*.html',
        './pages/**/*.html'
    ], ['fileinclude']);

    gulp.watch('./sass/**/*', ['sass']);
});

gulp.task('server-prod-prev', function() {
    browserSync.init({
        server: {
            baseDir: "./public/"
        },
        port: "7777"
    });
});

// компіляція sass/scss в css
gulp.task('sass', function() {
    gulp.src(['./sass/**/*.scss', './sass/**/*.sass'])
        .pipe(sourcemaps.init())
        .pipe(
            sass({ outputStyle: 'expanded' })
            .on('error', gutil.log)
        )
        .on('error', notify.onError())
        .pipe(sourcemaps.write())
        .pipe(autoprefixer({
            browsers: ['last 7 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('./css/'))
        .pipe(browserSync.stream());
});

// збірка сторінки з шаблонів
gulp.task('fileinclude', function() {
    gulp.src('./pages/**/*.html')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }).on('error', gutil.log))
        .on('error', notify.onError())
        .pipe(gulp.dest('./'))
});

// зтиснення svg, png, jpeg
gulp.task('minify:img', function() {
    // беремо всі картинки крім папки де лежать картинки для спрайту
    return gulp.src(['./images/**/*', '!./images/sprite/*'])
        .pipe(imagemin().on('error', gutil.log))
        .pipe(gulp.dest('./public/images/'));
});

// зтиснення css
gulp.task('minify:css', function() {
    gulp.src('./css/**/*.css')
        .pipe(csso())
        .pipe(gulp.dest('./public/css/'));
});

// зтиснення js
gulp.task('minify:js', function() {
    gulp.src('./js/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./public/js/'));
});

// зтиснення html
gulp.task('minify:html', function() {
    var opts = {
        conditionals: true,
        spare: true
    };

    return gulp.src(['./*.html'])
        .pipe(minifyHTML(opts))
        .pipe(gulp.dest('./public/'));
});

// видалити папку public
gulp.task('clean', function() {
    return gulp.src('./public', { read: false }).pipe(clean());
});

// створення спрайту з картинок з папки images/sprite
gulp.task('sprite', function() {
    var spriteData = gulp.src('images/sprite/*.png').pipe(
        spritesmith({
            imgName: 'sprite.png',
            cssName: 'icon-mixin.css',
            imgPath: '/images/sprite.png',
            // retinaImgName: 'sprite@2x.png',
            // retinaSrcFilter: ['images/sprite/*@2x.png'],
            cssVarMap: function(sprite) {
                sprite.name = sprite.name;
            }
        })
    );

    var imgStream = spriteData.img.pipe(gulp.dest('images/'));
    var cssStream = spriteData.css.pipe(gulp.dest('css/'));

    return merge(imgStream, cssStream);
});

gulp.task('sprite-service-icons', function() {
    var spriteData = gulp.src('images/sprite-services/*.png').pipe(
        spritesmith({
            imgName: 'sprite-services.png',
            cssName: 'icon-mixin-services.css',
            imgPath: '/images/sprite-services.png',
            // retinaImgName: 'sprite@2x.png',
            // retinaSrcFilter: ['images/sprite/*@2x.png'],
            cssVarMap: function(sprite) {
                sprite.name = sprite.name;
            }
        })
    );

    var imgStream = spriteData.img.pipe(gulp.dest('gulpimages/'));
    var cssStream = spriteData.css.pipe(gulp.dest('css/'));

    return merge(imgStream, cssStream);
});

// публікація на gh-pages
gulp.task('deploy', function() {
    return gulp.src('./public/**/*').pipe(ghPages());
});

// при виклику в терміналі команди gulp, буде запущені задачі 
// server - для запупуску сервера, 
// sass - для компіляції sass в css, тому що браузер 
// не розуміє попередній синтаксис,
// fileinclude - для того щоб з маленьких шаблонів зібрати повну сторінку
gulp.task('default', ['server', 'sass', 'fileinclude']);

// при виклику команди gulp production
// будуть стиснуті всі ресурси в папку public
// після чого командою gulp deploy їх можна опублікувати на github
gulp.task('production', ['minify:html', 'minify:css', 'minify:js', 'minify:img']);

