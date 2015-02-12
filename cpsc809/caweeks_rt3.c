#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include "rt2.h"
#include "rtlib.h"
//GLOBAL CONSTANTS--EGAD!!!
//Constants for generating sphere position pattern
const double PI = 3.14159265;
const double SPHERE_DEFAULT_RAD = .2;
const double SPHERE_Z_STEP = 0.5;
const int NUM_OBJS = NUM_SPHERES + NUM_PLANES;
//Radius of the primary central circle about which all sphere originate and rotate
const double CENTER_MAJOR_RAD = 0.8;

//constants for enabling / disabling features
const int ENABLE_REFLECTIONS = 1;
const int ENABLE_ANTI_ALIASING = 1;
const int ENABLE_SOFT_SHADOWS = 1;

const int LIGHT_RADIUS = 1; 
const int DEPTH_SAMPLES = 5;
const int RADIUS_SAMPLES = 5;
const int SOFT_SHADOW_RAY_COUNT = 125; 
const int MAX_REFLECTIONS = 5;
int reflectCount = 0;

//document constants
const int IMG_WIDTH = 500;
const int IMG_HEIGHT = 500;

OBJECT objs [NUM_SPHERES + NUM_PLANES];

LIGHT lights [NUM_LIGHTS];


/*finds the magnitude of the vector*/
double findVecMagnitude(VEC_PT vec){
  return sqrt((vec.x*vec.x) + (vec.y*vec.y) + (vec.z*vec.z));
}

VEC_PT normalize (VEC_PT vec){
   /*** find length of vec; scale vec by length; return new vec ***/
	double magnitude = findVecMagnitude(vec);
	VEC_PT normalizedVec;
	normalizedVec.x = vec.x / magnitude;
	normalizedVec.y = vec.y / magnitude;
	normalizedVec.z = vec.z / magnitude;
	return normalizedVec;
}

VEC_PT vecMult(VEC_PT u, VEC_PT v){
	VEC_PT w;
	w.x = u.x * v.x;
	w.y = u.y * v.y;
	w.z = u.z * v.z;
	return w;
}

VEC_PT vecScale (VEC_PT u, double scale){
	u.x *= scale;
	u.y *= scale;
	u.z *= scale;
	return u;
}

void colorPrint(COLOR c){
	printf("R: %f\nG: %f\nB: %f\n\n", c.R, c.G, c.B);
}

void vecPrint(VEC_PT c){
	printf("x: %f\ny: %f\nz: %f\n\n", c.x, c.y, c.z);
}

double dot (VEC_PT v1, VEC_PT v2){
   /*** return result of dot product formula ***/
	//a . b = ax * bx + ay * by + az * bz 
	double dotProd = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
	return dotProd;
}

//Interpolates between c1 and c2 based on value.  value must be between 0 and 1
COLOR interpolateColor(COLOR c1, COLOR c2, double value){
//	printf("c1:\n");
//	colorPrint(c1);	
//	printf("c2:\n");
//	colorPrint(c2);	
	double Rdiff = c2.R - c1.R;
	double Gdiff = c2.G - c1.G;
	double Bdiff = c2.B - c1.B;	

	COLOR newColor;
	newColor.R = c1.R + Rdiff*value;
	newColor.G = c1.G + Gdiff*value;
	newColor.B = c1.B + Bdiff*value;
//	printf("new:\n");
//	colorPrint(newColor);	
	return newColor;
}


void define_scene (void){
   	int i;
	int spiralCounter = 0;

	//deep purple to Yellow 
	COLOR spiral1C1 = {.4, 0, .4};
	COLOR spiral1C2 = {1, 1, 0};

	//dark blue to bright Red 
	COLOR spiral2C1 = {0, 0, .5};
	COLOR spiral2C2 = {1, .4, 0};

	//light blue to bright Orange
	COLOR spiral3C1 = {0.5, .3, .8};
	COLOR spiral3C2 = {1, 0, 0};
	double interpolateIndex;

	objs[0].object_type = PLANE;
	objs[0].plane_normal.x = 0;
	objs[0].plane_normal.y = 1;
	objs[0].plane_normal.z = 0;
	objs[0].plane_D = 2.0;
	objs[0].color.R = 1;
	objs[0].color.G = 1;
	objs[0].color.B = 1;
	objs[0].color2.R = 0.0;
	objs[0].color2.G = 0.0;
	objs[0].color2.B = 0.0;
	objs[0].checker = 1;
	objs[0].reflectivity = .2;

	for(i = 1; i <= NUM_SPHERES; i += 3){
		
		interpolateIndex = (double)spiralCounter/(NUM_SPHERES/3.0);
	//	printf("counter: %f\n", interpolateIndex);
	//	printf("%f\n", interpolateIndex);
		//Reddish spheres
		objs[i].object_type = SPHERE;
		objs[i].sph_ctr.x = CENTER_MAJOR_RAD*cos(PI*((float)spiralCounter/8));
		objs[i].sph_ctr.y = CENTER_MAJOR_RAD*sin(PI*((float)spiralCounter/8));
		objs[i].sph_ctr.z = 3.0 + spiralCounter*(SPHERE_Z_STEP);
		objs[i].sph_radius = SPHERE_DEFAULT_RAD; 
		objs[i].color = interpolateColor(spiral1C1, spiral1C2, interpolateIndex);
		objs[i].reflectivity = .3;


		//Bluish spheres
		objs[i+1].object_type = SPHERE;
		objs[i+1].sph_ctr.x = CENTER_MAJOR_RAD*cos(PI*((float)spiralCounter/8) + 2.0*PI/3.0);
		objs[i+1].sph_ctr.y = CENTER_MAJOR_RAD*sin(PI*((float)spiralCounter/8) + 2.0*PI/3.0);
		objs[i+1].sph_ctr.z = 3.0 + spiralCounter*(SPHERE_Z_STEP);
		objs[i+1].sph_radius = SPHERE_DEFAULT_RAD; 
		objs[i+1].color = interpolateColor(spiral2C1, spiral2C2, interpolateIndex);
		objs[i+1].reflectivity = .3;	

		//Greenish spheres
		objs[i+2].object_type = SPHERE;
		objs[i+2].sph_ctr.x = CENTER_MAJOR_RAD*cos(PI*((float)spiralCounter/8) + 4.0*PI/3.0);
		objs[i+2].sph_ctr.y = CENTER_MAJOR_RAD*sin(PI*((float)spiralCounter/8) + 4.0*PI/3.0);
		objs[i+2].sph_ctr.z = 3.0 + spiralCounter*(SPHERE_Z_STEP);
		objs[i+2].sph_radius = SPHERE_DEFAULT_RAD; 
		objs[i+2].color = interpolateColor(spiral3C1, spiral3C2, interpolateIndex);
		objs[i+2].reflectivity = .3;

		spiralCounter++;
	}


	lights[0].location.x = -5;
	lights[0].location.y = 10;
	lights[0].location.z = -10;
	lights[0].color.R = .8;
	lights[0].color.G = .8;
	lights[0].color.B = .8;

	lights[1].location.x = 0;
	lights[1].location.y = 3;
	lights[1].location.z = -10;
	lights[1].color.R = .8;
	lights[1].color.G = .8;
	lights[1].color.B = .8;

	lights[2].location.x = 5;
	lights[2].location.y = 10;
	lights[2].location.z = -10;
	lights[2].color.R = .8;
	lights[2].color.G = .8;
	lights[2].color.B = .8;
}
   
COLOR light (RAY ray, VEC_PT int_pt, VEC_PT normal, int index){
   /*** use global variables, objs and lights ***/
   /*** use index to find the object's color ***/
   VEC_PT lightVector;
   normal = normalize(normal);
   COLOR finColor;
   COLOR currLightColor = {0, 0, 0};
   double falloff;
   double lightDistance;
   //variables for shadow testing
   RAY shadowRayTest;
	VEC_PT intersection_pt;
	VEC_PT shadowNormal;
	int objIndex;
	double distance;

   shadowRayTest.origin = int_pt;
   int color1Or2 = ((int)floor(int_pt.x) + (int)floor(int_pt.y) + (int)floor(int_pt.z))&1 && objs[index].checker;

   int i, j, k, m;
   int shadowTest;
   double soft_shadow_hits;
   finColor.R = 0;
   finColor.G = 0;
   finColor.B = 0;
	for(i = 0; i < NUM_LIGHTS; i++){

	   lightVector.x = lights[i].location.x - int_pt.x;
	   lightVector.y = lights[i].location.y - int_pt.y;
	   lightVector.z = lights[i].location.z - int_pt.z;
	   lightDistance = findVecMagnitude(lightVector);
//			printf("light:\n");
//			vecPrint(lightVector);
	   
	   //test for shadows.  does not check if light is a point light
	   if(ENABLE_SOFT_SHADOWS){
			soft_shadow_hits = 0;
		   for(j = 0; j < DEPTH_SAMPLES; j++){
			   for(k = 0; k < RADIUS_SAMPLES; k++){
				   for(m = 0; m < RADIUS_SAMPLES; m++){
				   //shoots a constant amount of rays to the light to calculate soft shadows 
					VEC_PT lightVectorJitter = lightVector;
					//printf("light:\n");
					//vecPrint(lightVector);
					//printf("Jitter: %f\n",(((((double)rand() / (double)RAND_MAX) * LIGHT_RADIUS*2)) - LIGHT_RADIUS));
					//creating the jitter.  made overly complicated by the fact that rand() returns an int rather than a double
					lightVectorJitter.x = lights[i].location.x - int_pt.x + (double)LIGHT_RADIUS * ((double)j/DEPTH_SAMPLES) - LIGHT_RADIUS/2;
					lightVectorJitter.y = lights[i].location.y - int_pt.y + (double)LIGHT_RADIUS * ((double)k/DEPTH_SAMPLES) - LIGHT_RADIUS/2;
					lightVectorJitter.z = lights[i].location.z - int_pt.z + (double)LIGHT_RADIUS * ((double)m/DEPTH_SAMPLES) - LIGHT_RADIUS/2;;
					//lightVectorJitter = normalize(lightVectorJitter);
					//lghtVectorJitter.x += lightVector.x;
					//lightVectorJitter.y += lightVector.x;
					//lightVectorJitter. += lightVector.x;
				//	printf("lightJitter:\n");
				//	vecPrint(lightVectorJitter);
				//	printf("light:\n");
				//	vecPrint(lightVector);
				//	printf("jitter:\n");
				//	vecPrint(lightVectorJitter);
					shadowRayTest.direction = normalize(lightVectorJitter);
					shadowTest = find_closest_intersection(shadowRayTest, objs, &intersection_pt, &shadowNormal, &objIndex, &distance, NUM_OBJS);
				   if(!shadowTest)
						soft_shadow_hits++;
				   }
			   }
		   }
		   if(soft_shadow_hits > 0)
			   shadowTest = 0;
		   else
			   shadowTest = 1;
			lightVector = normalize(lightVector);
	   }
	   else{
		   lightVector = normalize(lightVector);
		   shadowRayTest.direction = lightVector;
		   shadowTest = find_closest_intersection(shadowRayTest, objs, &intersection_pt, &shadowNormal, &objIndex, &distance, NUM_OBJS);
	   }
	   if(!shadowTest || (shadowTest && objIndex == index)){

		   falloff = 1 / (.004 * pow(lightDistance, 2) + .02*lightDistance + .2);
		   /*** compute ambient ***/
		   if(color1Or2){
			   currLightColor.R = .1 * objs[index].color2.R * (1 - objs[index].reflectivity);
			   currLightColor.G = .1 * objs[index].color2.G * (1 - objs[index].reflectivity);
			   currLightColor.B = .1 * objs[index].color2.B * (1 - objs[index].reflectivity);
		   }
		   else{
			   currLightColor.R = .1 * objs[index].color.R * (1 - objs[index].reflectivity);
			   currLightColor.G = .1 * objs[index].color.G * (1 - objs[index].reflectivity);
			   currLightColor.B = .1 * objs[index].color.B * (1 - objs[index].reflectivity);
		   }
		  // printf("%f", currLightColor.R);


		   /*** compute diffuse ***/
		   double cosTheta = dot(lightVector, normal);
		   if(cosTheta > 0){
			   if(color1Or2){
				   currLightColor.R += cosTheta * objs[index].color2.R * falloff * (1 - objs[index].reflectivity);
				   currLightColor.G += cosTheta * objs[index].color2.G * falloff * (1 - objs[index].reflectivity);
				   currLightColor.B += cosTheta * objs[index].color2.B * falloff * (1 - objs[index].reflectivity);
			   }
			   else{
				   currLightColor.R += cosTheta * objs[index].color.R * falloff * (1 - objs[index].reflectivity);
				   currLightColor.G += cosTheta * objs[index].color.G * falloff * (1 - objs[index].reflectivity);
				   currLightColor.B += cosTheta * objs[index].color.B * falloff * (1 - objs[index].reflectivity);
			   }
		   
		   /*** compute specular ***/
				VEC_PT  reflected;
				reflected.x = lightVector.x - 2 * cosTheta * normal.x;
				reflected.y = lightVector.y - 2 * cosTheta * normal.y;
				reflected.z = lightVector.z - 2 * cosTheta * normal.z;
				double specDot = dot(ray.direction, reflected);
				if(specDot > 0){
					currLightColor.R += pow(specDot, 80)*lights[i].color.R * falloff;
					currLightColor.G += pow(specDot, 80)*lights[i].color.G * falloff;
					currLightColor.B += pow(specDot, 80)*lights[i].color.B * falloff;	
				}
				if(ENABLE_SOFT_SHADOWS && LIGHT_RADIUS > 0){
					double shadowConst = soft_shadow_hits / SOFT_SHADOW_RAY_COUNT;
					finColor.R += currLightColor.R * shadowConst;
					finColor.G += currLightColor.G * shadowConst;
					finColor.B += currLightColor.B * shadowConst;
				}
				else{
					finColor.R += currLightColor.R;
					finColor.G += currLightColor.G;
					finColor.B += currLightColor.B;
				}
		   }
	   }
	}
	return finColor;
}

COLOR trace (RAY ray){
   /*** declare a variable to denote the final color this pixel will be ***/
	COLOR localColor;
	COLOR reflectedColor = {0,0,0};
	COLOR finalColor;
	VEC_PT intersection_pt;
	VEC_PT normal;
	int objIndex;
	double distance;

   /*** initialize final color to the background color (0, 0, 0) ***/
	finalColor.R = .5;
	finalColor.G = .3;
	finalColor.B = .3;

   /*** call library code to find the closest intersection ***/
   int isFound = find_closest_intersection(ray, objs, &intersection_pt, &normal, &objIndex, &distance, NUM_OBJS);

   /*** if an intersection is found, get the color by calling the light function ***/
   if(isFound){
		 //  printf("%d", isFound);
		if(ENABLE_REFLECTIONS){
			if(objs[objIndex].reflectivity > 0 && reflectCount < MAX_REFLECTIONS){

				reflectCount++;

				//calculate the reflected ray
				RAY reflectRay;
				reflectRay.origin = intersection_pt;
				//normal = normalize(normal);
				double cosTheta = dot(ray.direction, normal);
				reflectRay.direction.x = ray.direction.x - 2 * cosTheta * normal.x;
				reflectRay.direction.y = ray.direction.y - 2 * cosTheta * normal.y;
				reflectRay.direction.z = ray.direction.z - 2 * cosTheta * normal.z;
				//trace it
				reflectedColor = trace(reflectRay);
			}
		   localColor = light(ray, intersection_pt, normal, objIndex);
		   finalColor.R = objs[objIndex].reflectivity*reflectedColor.R + (1-objs[objIndex].reflectivity)*localColor.R;
		   finalColor.G = objs[objIndex].reflectivity*reflectedColor.G + (1-objs[objIndex].reflectivity)*localColor.G;
		   finalColor.B = objs[objIndex].reflectivity*reflectedColor.B + (1-objs[objIndex].reflectivity)*localColor.B;
		}
		else{
		   finalColor = light(ray, intersection_pt, normal, objIndex);
		}
   }
   /*** return final color ***/
   return finalColor;
}

//	printf("%d", s);
int main (){
   /*** declare loop counters, ray, and pixel color variables here ***/
	int i = 0, j = 0;
	COLOR rayColor;
	VEC_PT testVec;
	testVec.x = 9;
	testVec.y = 9;
	testVec.z = 9;
	findVecMagnitude(testVec);
	testVec = normalize(testVec);

	RAY iterRay;
	iterRay.origin.x = 0;
	iterRay.origin.y = 0;
	iterRay.origin.z = 0;
	unsigned char R = 0;
	unsigned char G = 0;
	unsigned char B = 0;

   /*** call define_scene to set up the objects and lights ***/
	define_scene();

   /*** output ppm header ***/
   printf ("P3\n500 500\n255\n");

   /*** create a nested loop here to iterate through all the pixels ***/
   for (i = 0; i < HEIGHT; i++) {

      for (j = 0; j < WIDTH; j++) {

		  if(ENABLE_ANTI_ALIASING){
			  int k, m;
			  COLOR raySum = {0, 0, 0};

			  //Rather than take all of my samples on the edge of the pixel, I think it makes more sense
			  //to take samples at the center of each cell in a 3x3 grid over each pixel.  This eliminates
			  //the need for weights and also the possibility that samples will be taken outside of the pixel
			  //because of random jittering.
			  double aliasStep = 1.0 / IMG_WIDTH / 6.0;
			  double xJitter, yJitter;

			  for(k = 0; k < 3; k++){
				  for(m = 0; m < 3; m++){
					 reflectCount = 0;
					  xJitter = (((double)(rand() % 1000) / 2000.0) / (double)IMG_WIDTH) - aliasStep;
					  yJitter = (((double)(rand() % 1000) / 2000.0) / (double)IMG_HEIGHT) - aliasStep;
				//	  printf("%f, %f\n", xJitter, yJitter);
					  //since each sample is at the center of each cell, the distance between each is 1/6th a pixel,
					  //with a buffer of 1/6th between the samples and the edge of the pixel. I increased the jitter
					  //radius to be 1/4th of a pixel, though 
					  iterRay.direction.x = -.5 + ((float)(j) / IMG_WIDTH) + aliasStep + (m*aliasStep) + xJitter;
					  iterRay.direction.y = .5 - (((float)(i) / IMG_HEIGHT) + aliasStep + (k*aliasStep) + yJitter);
					  iterRay.direction.z = 1;
					  iterRay.direction = normalize(iterRay.direction);
					  reflectCount = 0;
					  rayColor = trace(iterRay);
					  if( rayColor.R > 1)
						  rayColor.R = 1;
					  if( rayColor.G > 1)
						  rayColor.G = 1;
					  if( rayColor.B > 1)
						  rayColor.B = 1;
					  raySum.R += rayColor.R;
					  raySum.G += rayColor.G;
					  raySum.B += rayColor.B;
				  }
			  }
			  //colorPrint(raySum);
			  rayColor.R = raySum.R / 9.0;
			  rayColor.G = raySum.G / 9.0;
			  rayColor.B = raySum.B / 9.0;
		  }
		  else{
			  reflectCount = 0;
			 /*** compute the ray direction ***/
			  iterRay.direction.x = -.5 + (float)(j) / 500.0;
			  iterRay.direction.y = .5 - (float)(i) / 500.0;
			  iterRay.direction.z = 1;

			 /*** normalize ray direction ***/
			  iterRay.direction = normalize(iterRay.direction);
			 
			 /*** call trace with ray ***/
			  rayColor = trace(iterRay);

			 /*** cap color channels to 1 ***/
		  }
		  if( rayColor.R > 1)
			  rayColor.R = 1;
		  if( rayColor.G > 1)
			  rayColor.G = 1;
		  if( rayColor.B > 1)
			  rayColor.B = 1;
		
		  R = (unsigned char)(255*rayColor.R);
		  G = (unsigned char)(255*rayColor.G);
		  B = (unsigned char)(255*rayColor.B);
         /*** print out pixel channels in 0..255 int range ***/
		 printf("%d %d %d ", R,G,B);
      }
	  printf("\n");
   }
   return 0;
}
