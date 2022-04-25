import intersects from "intersects";


function isTouch(r1, r2){
    let touch = intersects.boxBox(r1.x, r1.y, r1.w, r2.h, r2.x, r2.y, r2.w, r2.h);
    return touch;
}

function isMobile(){
    if(window.navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)) {
        return true; // 移动端
    }else{
        return false; // PC端
    }
}

export {
    isTouch,
    isMobile
}
