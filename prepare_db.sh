MARKER=fv_mgr_db_marker
sed -i "/# BEGIN $MARKER/,/# END $MARKER/d" .env 2>/dev/null
pass=$(openssl rand -hex 16)
{
  echo "# BEGIN $MARKER"
  echo "DATABASE_URL=\"postgres://postgres:$pass@127.0.0.1:5432/fv_mgr_db?sslmode=disable\""
  echo "# END $MARKER"
} >> .env
docker run -d --name fv_mgr_pg --rm --network=host -e POSTGRES_PASSWORD=$pass -e POSTGRES_DB=fv_mgr_db  docker.io/postgres
echo "waiting for db to start"
sleep 15

prisma generate
prisma db push