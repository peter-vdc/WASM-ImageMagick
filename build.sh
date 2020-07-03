
export CPPFLAGS="-I/code/libpng -I/code/zlib -I/code/libjpeg -I/code/libwebp -I/code/libwebp/src -I/code/libwebp/src/webp"
export LDFLAGS="-L/code/zlib -L/code/libpng -L/code/libpng/.libs -L/code/libjpeg -L/code/libwebp -L/code/libwebp/src -L/code/libwebp/src/webp"
export CFLAGS="-O3"
export CXXFLAGS="$CFLAGS"
MAKE_FLAGS="-s BINARYEN_TRAP_MODE=clamp -s ALLOW_MEMORY_GROWTH=1 -s ENVIRONMENT=node -s"

# export CFLAGS="-O0 -g2"
# export CXXFLAGS="$CFLAGS"
# MAKE_FLAGS="-s BINARYEN_TRAP_MODE=clamp -s ALLOW_MEMORY_GROWTH=1 -s SAFE_HEAP=1 -s ASSERTIONS=1"

export PKG_CONFIG_PATH="/code/libpng:/code/zlib:/code/libjpeg:/code/libwebp:/code/libwebp/src:/code/libwebp/src:webp"
export PNG_LIBS="-L/code/libpng -L/code/libpng/.libs"

figlet "Compile zlib..."
cd /code/zlib
emconfigure ./configure --static
emcmake make $MAKE_FLAGS CFLAGS="$CFLAGS" CXXFLAGS="$CXXFLAGS" 

figlet "Compile jpeg-lib..."
cd /code/libjpeg
autoreconf -fvi
emconfigure ./configure --disable-shared
emcmake make $MAKE_FLAGS CFLAGS="$CFLAGS" CXXFLAGS="$CXXFLAGS" 

figlet "Compile webp-lib..."
cd /code/libwebp
libtoolize
./autogen
autoreconf
automake --add-missing
emconfigure ./configure --disable-shared
emcmake make $MAKE_FLAGS CFLAGS="$CFLAGS" CXXFLAGS="$CXXFLAGS" 

figlet "Compile png-lib..."
cd /code/libpng
libtoolize
# aclocal
autoreconf
automake --add-missing
# ./autogen
emconfigure ./configure --disable-shared
emcmake make $MAKE_FLAGS CFLAGS="$CFLAGS" CXXFLAGS="$CXXFLAGS" 

figlet "Compile ImageMagick..."
cd /code/ImageMagick
autoconf
#emconfigure ./configure --prefix=/ --disable-shared --without-threads --without-magick-plus-plus --without-perl --without-x --disable-largefile --disable-openmp --without-bzlib --without-dps --without-freetype --without-jbig --without-openjp2 --without-lcms --without-wmf --without-xml --without-fftw --without-flif --without-fpx --without-djvu --without-fontconfig --without-raqm --without-gslib --without-gvc --without-heic --without-lqr --without-openexr --without-pango --without-raw --without-rsvg --without-xml PKG_CONFIG_PATH="/code/libpng:/code/libpng/.libs:/code/zlib:/code/libjpeg:/code/libwebp:/code/libwebp/src:/code/libwebp/src/webp:"
emconfigure ./configure --prefix=/ --disable-shared --without-threads --without-magick-plus-plus --without-perl --without-x --disable-largefile --disable-openmp --without-bzlib --without-dps --without-freetype --without-jbig --without-openjp2 --without-lcms --without-wmf --without-xml --without-fftw --without-flif --without-fpx --without-djvu --without-fontconfig --without-raqm --without-gslib --without-gvc --without-heic --without-lqr --without-openexr --without-pango --without-raw --without-rsvg --without-xml PKG_CONFIG_PATH="/code/libpng:/code/zlib:/code/libjpeg:/code/libwebp:/code/libwebp/src:/code/libwebp/src/webp:"
emcmake make $MAKE_FLAGS CFLAGS="$CFLAGS" CXXFLAGS="$CXXFLAGS" 

figlet "Creating output files..."
#produce the correct output file
#/bin/bash ./libtool --silent --tag=CC --mode=link emcc --pre-js /code/webworker.js $MAKE_FLAGS $CXXFLAGS -L/code/zlib -L/code/libpng -L/code/libpng/.libs -L/code/libjpeg -L/code/zlib -L/code/libpng -L/code/libpng/.libs -L/code/libjpeg -L/code/libwebp -L/code/libwebp/src -o utilities/magick.html utilities/magick.o MagickCore/libMagickCore-7.Q16HDRI.la MagickWand/libMagickWand-7.Q16HDRI.la 
/bin/bash ./libtool --tag=CC --mode=link emcc $MAKE_FLAGS $CXXFLAGS -L/code/zlib -L/code/libpng -L/code/libpng/.libs -L/code/libjpeg -L/code/zlib -L/code/libpng -L/code/libpng/.libs -L/code/libjpeg -L/code/libwebp -L/code/libwebp/src -o utilities/magick.html utilities/magick.o MagickCore/libMagickCore-7.Q16HDRI.la MagickWand/libMagickWand-7.Q16HDRI.la
