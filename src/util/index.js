import intersects from "intersects";


function isTouch(r1, r2){
    let touch = intersects.boxBox(r1.x, r1.y, r1.w, r2.h, r2.x, r2.y, r2.w, r2.h);
    return touch;
}

export {
    isTouch
}
