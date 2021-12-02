// else
// {
//     if(this.totalAngle > this.angleThreshold);
//     {
//         this.rotationDecided = true;
//         this.secondSideIntersection = rayCubieSideIntersection(this.selectedCubiePos, [this.renderer.pos[0], this.renderer.pos[1], this.renderer.pos[2]], rayDirWorld);
//         let relativePosOnPlane = vec3.create();
//         vec3.subtract(relativePosOnPlane, this.secondSideIntersection, this.firstSideIntersection);

//         console.log(vec3.str(relativePosOnPlane));

//         // get basis components:
//         let xComp = Math.abs(vec3.dot(relativePosOnPlane, iBasis));
//         let yComp = Math.abs(vec3.dot(relativePosOnPlane, jBasis));
//         let zComp = Math.abs(vec3.dot(relativePosOnPlane, kBasis));

//         // XY plane cases:
//         if(relativePosOnPlane[2] == 0)
//         {
//             // vertical line on xy plane
//             if(relativePosOnPlane[0] == 0)
//             {
//                 console.log("spin around x axis");
//                 this.matrixTranslationIndexNum = 12;
//             }
//             // horizontal line on xy plane
//             else if(relativePosOnPlane[1] == 0)
//             {
//                 console.log("spin around y axis");
//                 this.matrixTranslationIndexNum = 13;
//             }
//             else
//             {
//                 if(Math.max(xComp, yComp) == xComp)
//                 {
//                     console.log("spin around y axis");
//                     // this.angleSign = Math.sign(vec3.dot(relativePosOnPlane, iBasis));
//                     this.matrixTranslationIndexNum = 13;
//                 }
//                 else
//                 {
//                     console.log("spin around x axis");
//                     //this.angleSign = Math.sign(vec3.dot(relativePosOnPlane, jBasis));
//                     this.matrixTranslationIndexNum = 12;
//                 }
//             }
//         }
//         // XZ plane cases:
//         if(relativePosOnPlane[1] == 0)
//         {
//             // vertical line on xz plane
//             if(relativePosOnPlane[0] == 0)
//             {
//                 console.log("spin around x axis");
//                 this.matrixTranslationIndexNum = 12;
//             }
//             // horizontal line on xz plane
//             else if(relativePosOnPlane[2] == 0)
//             {
//                 console.log("spin around z axis");
//                 this.matrixTranslationIndexNum = 14;
//             }
//             else
//             {
//                 // console.log("ycomp = 0");
//                 if(Math.max(xComp, zComp) == xComp)
//                 {
//                     console.log("spin around z axis");
//                     //this.angleSign = Math.sign(vec3.dot(relativePosOnPlane, iBasis));
//                     this.angleSign = 1;
//                     this.matrixTranslationIndexNum = 14;
//                 }
//                 else
//                 {
//                     console.log("spin around x axis");
//                     //this.angleSign = Math.sign(vec3.dot(relativePosOnPlane, kBasis));
//                     this.angleSign = 1;
//                     this.matrixTranslationIndexNum = 12;
//                 }
//             }
//         }
//         // YZ plane cases:
//         if(relativePosOnPlane[0] == 0)
//         {
//             // vertical line on yz plane
//             if(relativePosOnPlane[2] == 0)
//             {
//                 console.log("spin around z axis");
//                 this.matrixTranslationIndexNum = 14;
//             }
//             // horizontal line on xz plane
//             else if(relativePosOnPlane[1] == 0)
//             {
//                 console.log("spin around y axis");
//                 this.matrixTranslationIndexNum = 13;
//             }
//             else
//             {
//                 if(Math.max(yComp, zComp) == yComp)
//                 {
//                     console.log("spin around z axis");
//                     //this.angleSign = Math.sign(vec3.dot(relativePosOnPlane, jBasis));
//                     this.angleSign = 1;
//                     this.matrixTranslationIndexNum = 14;
//                 }
//                 else
//                 {
//                     console.log("spin around y axis");
//                     //this.angleSign = Math.sign(vec3.dot(relativePosOnPlane, kBasis));
//                     this.angleSign = 1;
//                     this.matrixTranslationIndexNum = 13;
//                 }
//             }
//         }
//     }
// }