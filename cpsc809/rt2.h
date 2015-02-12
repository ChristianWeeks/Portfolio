#ifndef RT_H
#define RT_H

#define WIDTH 500
#define HEIGHT 500

#define NUM_SPHERES 18 
#define NUM_PLANES 1
#define NUM_LIGHTS 3 

#define SPHERE 0
#define PLANE 1
#define BOX 2

typedef struct {
  double x;
  double y;
  double z;
} VEC_PT;


typedef struct {
  double R;
  double G;
  double B;
} COLOR;

typedef struct {
  VEC_PT origin;
  VEC_PT direction;
} RAY;


typedef struct {
  int object_type;

  VEC_PT sph_ctr;
  double sph_radius;

  VEC_PT plane_normal;
  double plane_D;

  VEC_PT box_ll;
  VEC_PT box_ur;

  COLOR color;

  int checker;
  COLOR color2;

  double reflectivity;

  double refractivity;
  double index_of_refraction;

  int bump;

  /* extra variables for personal use */
  double user1, user2, user3;
  VEC_PT userv1, userv2, userv3;
  COLOR userc1, userc2, userc3;

} OBJECT;


typedef struct {
  VEC_PT location;
  COLOR color;
} LIGHT;

#endif

